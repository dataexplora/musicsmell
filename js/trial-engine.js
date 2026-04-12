/**
 * Trial Engine — Executes a single trial with precise timing.
 *
 * Trial phases: PRIME → ISI → TARGET → RESPONSE → PAUSE
 */
const TrialEngine = {
  /** Durations in milliseconds (hardcoded for now) */
  DURATIONS: {
    PRIME: 3000,
    ISI: 1000,
    TARGET: 3000,
    PAUSE: 1000
  },

  /** @type {HTMLAudioElement|null} */
  _currentAudio: null,

  /**
   * Run a single trial.
   * @param {Object} trial - Trial data from CSV
   * @param {Object} callbacks
   * @param {Function} callbacks.onPhaseChange - Called with (phase) on each phase transition
   * @param {Function} callbacks.onWaitForResponse - Called with (resolveFn) when waiting for participant click
   * @returns {Promise<{response: string, responseTimeMs: number}>}
   */
  async runTrial(trial, callbacks) {
    // --- PRIME ---
    callbacks.onPhaseChange('PRIME');
    this._currentAudio = this._playIfAuditory(trial.PrimeType, trial.Prime);
    await this._wait(this.DURATIONS.PRIME);
    this._stopAudio();

    // --- ISI ---
    callbacks.onPhaseChange('ISI');
    await this._wait(this.DURATIONS.ISI);

    // --- TARGET ---
    callbacks.onPhaseChange('TARGET');
    this._currentAudio = this._playIfAuditory(trial.TargetType, trial.Target);
    await this._wait(this.DURATIONS.TARGET);
    this._stopAudio();

    // --- RESPONSE ---
    callbacks.onPhaseChange('RESPONSE');
    const responseStartTime = performance.now();

    const response = await new Promise(resolve => {
      callbacks.onWaitForResponse(resolve);
    });

    const responseTimeMs = Math.round(performance.now() - responseStartTime);

    // --- PAUSE ---
    callbacks.onPhaseChange('PAUSE');
    await this._wait(this.DURATIONS.PAUSE);

    return { response, responseTimeMs };
  },

  /**
   * Play audio if the stimulus type is Auditory.
   */
  _playIfAuditory(type, value) {
    if (type === 'Auditory') {
      return AudioManager.play(value);
    }
    return null;
  },

  _stopAudio() {
    if (this._currentAudio) {
      AudioManager.stop(this._currentAudio);
      this._currentAudio = null;
    }
  },

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
