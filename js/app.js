/**
 * App — Main application controller (participant side).
 *
 * Receives commands from the researcher screen via postMessage.
 * Handles audio playback, stimulus display, response collection, and export.
 */
const App = {
  state: 'WAITING', // WAITING | RUNNING | COMPLETE
  trials: [],
  results: [],
  currentTrialIndex: 0,

  /** @type {Window|null} */
  researcherWindow: null,

  init() {
    UI.init();

    // Open researcher screen button (small, discreet)
    document.getElementById('btn-setup').addEventListener('click', () => {
      this._openResearcherScreen();
    });

    // Listen for commands from researcher screen
    window.addEventListener('message', (event) => {
      this._handleResearcherMessage(event.data);
    });
  },

  _openResearcherScreen() {
    this.researcherWindow = window.open(
      'researcher.html',
      'musicsmell-researcher',
      'width=900,height=700'
    );
    // Hide setup button once researcher screen is open
    if (this.researcherWindow) {
      document.getElementById('btn-setup').style.display = 'none';
    }
  },

  // --- Message Handling (from researcher) ---

  async _handleResearcherMessage(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'load-audio':
        await this._loadAudioFiles(data.files);
        break;

      case 'load-csv':
        this._loadCSV(data.csvText);
        break;

      case 'start':
        this._startExperiment();
        break;

      case 'new-session':
        this._resetForNewSession();
        break;
    }
  },

  async _loadAudioFiles(files) {
    try {
      const loaded = await AudioManager.loadFromFiles(files);
      this._notifyResearcher({
        type: 'audio-ready',
        fileNames: loaded
      });
    } catch (err) {
      this._notifyResearcher({
        type: 'audio-error',
        message: err.message
      });
    }
  },

  _loadCSV(csvText) {
    try {
      this.trials = CSVParser.parse(csvText);
      const t = this.trials[0];
      this._notifyResearcher({
        type: 'csv-ready',
        trialCount: this.trials.length,
        participantId: t.ParticipantID,
        session: t.Session
      });
    } catch (err) {
      this._notifyResearcher({
        type: 'csv-error',
        message: err.message
      });
    }
  },

  // --- Experiment Execution ---

  async _startExperiment() {
    this.state = 'RUNNING';
    this.currentTrialIndex = 0;
    this.results = [];

    UI.showScreen('screen-experiment');

    // Preparation screen (3s)
    UI.renderPreparation();
    this._notifyResearcher({
      type: 'trial-update',
      trial: this.trials[0],
      nextTrial: this.trials[1] || null,
      trialIndex: 0,
      totalTrials: this.trials.length,
      phase: 'PREPARING'
    });
    await this._wait(3000);

    // Run all trials
    for (let i = 0; i < this.trials.length; i++) {
      this.currentTrialIndex = i;
      const trial = this.trials[i];
      const nextTrial = this.trials[i + 1] || null;

      const result = await TrialEngine.runTrial(trial, {
        onPhaseChange: (phase) => {
          UI.renderPhase(phase, trial);
          this._notifyResearcher({
            type: 'trial-update',
            trial,
            nextTrial,
            trialIndex: i,
            totalTrials: this.trials.length,
            phase
          });
        },
        onWaitForResponse: (resolve) => {
          UI.setResponseResolver(resolve);
        }
      });

      this.results.push({
        ...trial,
        ...result.response,
        ResponseTimeMs: result.responseTimeMs
      });

      Export.backupToLocalStorage(this.results);
    }

    this._endExperiment();
  },

  _endExperiment() {
    this.state = 'COMPLETE';
    UI.showScreen('screen-end');

    const pid = this.trials[0].ParticipantID;
    const session = this.trials[0].Session;

    Export.download(this.results, pid, session);
    this._notifyResearcher({ type: 'complete' });
  },

  _resetForNewSession() {
    this.state = 'WAITING';
    this.trials = [];
    this.results = [];
    this.currentTrialIndex = 0;

    // Audio stays loaded
    UI.showScreen('screen-waiting');

    this._notifyResearcher({ type: 'session-reset' });
  },

  // --- Researcher Communication ---

  _notifyResearcher(data) {
    if (this.researcherWindow && !this.researcherWindow.closed) {
      this.researcherWindow.postMessage(data, '*');
    }
  },

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
