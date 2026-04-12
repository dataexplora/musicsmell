/**
 * UI — Renders experiment phases on the participant screen.
 */
const UI = {
  RESPONSE_WORDS: ['Λιακάδα', 'Αιχμή', 'Μάζα', 'Θαλπωρή', 'Αύρα', 'Νέκταρ'],

  /** @type {HTMLElement} */
  _content: null,

  /** @type {Function|null} */
  _resolveResponse: null,

  init() {
    this._content = document.getElementById('experiment-content');
  },

  /**
   * Switch visible screen.
   * @param {string} screenId - e.g. 'screen-setup', 'screen-experiment', 'screen-end'
   */
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  },

  /**
   * Render the appropriate display for a trial phase.
   * @param {string} phase - PRIME, ISI, TARGET, RESPONSE, PAUSE
   * @param {Object} trial - Current trial data
   */
  renderPhase(phase, trial) {
    switch (phase) {
      case 'PRIME':
        this._renderStimulus(trial.PrimeType, trial.Prime);
        break;
      case 'TARGET':
        this._renderStimulus(trial.TargetType, trial.Target);
        break;
      case 'RESPONSE':
        this._renderResponse();
        break;
      case 'ISI':
      case 'PAUSE':
        this._renderBlank();
        break;
    }
  },

  /**
   * Show "Ετοιμαστείτε..." before the first trial.
   */
  renderPreparation() {
    this._content.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'stimulus-instruction';
    el.textContent = 'Ετοιμαστείτε...';
    this._content.appendChild(el);
  },

  /**
   * Render a stimulus based on its type.
   */
  _renderStimulus(type, value) {
    this._content.innerHTML = '';

    const el = document.createElement('div');

    if (type === 'Auditory') {
      el.className = 'stimulus-instruction';
      el.textContent = 'Ακούστε τον ήχο';
    } else if (type === 'Olfactory') {
      el.className = 'stimulus-instruction';
      el.textContent = 'Μυρίστε';
    } else if (type === 'Lexical') {
      el.className = 'lexical-prime';
      el.textContent = value;
    }

    this._content.appendChild(el);
  },

  _renderBlank() {
    this._content.innerHTML = '';
  },

  /**
   * Render response buttons (6 words, shuffled).
   */
  _renderResponse() {
    this._content.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'response-container';

    const shuffled = this._shuffle([...this.RESPONSE_WORDS]);

    shuffled.forEach(word => {
      const btn = document.createElement('button');
      btn.className = 'response-btn';
      btn.textContent = word;
      btn.addEventListener('click', () => {
        if (this._resolveResponse) {
          const resolve = this._resolveResponse;
          this._resolveResponse = null;
          resolve(word);
        }
      });
      container.appendChild(btn);
    });

    this._content.appendChild(container);
  },

  /**
   * Set the resolver function for the current response.
   * @param {Function} resolver
   */
  setResponseResolver(resolver) {
    this._resolveResponse = resolver;
  },

  showEnd() {
    this.showScreen('screen-end');
  },

  /**
   * Fisher-Yates shuffle.
   */
  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
};
