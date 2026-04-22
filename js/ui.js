/**
 * UI — Renders experiment phases on the participant screen.
 */
const UI = {
  /** Fixed order — same in UI and CSV export */
  RESPONSE_WORDS: ['Λιακάδα', 'Αιχμή', 'Μάζα', 'Θαλπωρή', 'Αύρα', 'Νέκταρ'],

  /** @type {HTMLElement} */
  _content: null,

  /** @type {Function|null} */
  _resolveResponse: null,

  init() {
    this._content = document.getElementById('experiment-content');
  },

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  },

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

  renderPreparation() {
    this._content.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'stimulus-instruction';
    el.textContent = 'Ετοιμαστείτε...';
    this._content.appendChild(el);
  },

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
   * Render 6 slider scales (fixed order) + confirm button.
   */
  _renderResponse() {
    this._content.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'slider-container';

    const sliders = {};

    // Create one slider row per dimension
    this.RESPONSE_WORDS.forEach(word => {
      const row = document.createElement('div');
      row.className = 'slider-row inactive';

      const label = document.createElement('span');
      label.className = 'slider-label';
      label.textContent = word;

      const input = document.createElement('input');
      input.type = 'range';
      input.className = 'slider-input';
      input.min = '0';
      input.max = '100';
      input.value = '0';

      input.addEventListener('input', () => {
        const val = parseInt(input.value);
        row.classList.toggle('inactive', val === 0);
        this._updateConfirmButton(sliders, confirmBtn);
      });

      sliders[word] = input;
      row.appendChild(label);
      row.appendChild(input);
      container.appendChild(row);
    });

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn-confirm';
    confirmBtn.textContent = 'Επιβεβαίωση';
    confirmBtn.disabled = true;

    confirmBtn.addEventListener('click', () => {
      if (this._resolveResponse) {
        const values = {};
        this.RESPONSE_WORDS.forEach(word => {
          values[word] = parseInt(sliders[word].value);
        });
        const resolve = this._resolveResponse;
        this._resolveResponse = null;
        resolve(values);
      }
    });

    container.appendChild(confirmBtn);
    this._content.appendChild(container);
  },

  /**
   * Enable confirm button if at least one slider > 0.
   */
  _updateConfirmButton(sliders, btn) {
    const anyActive = this.RESPONSE_WORDS.some(
      word => parseInt(sliders[word].value) > 0
    );
    btn.disabled = !anyActive;
  },

  setResponseResolver(resolver) {
    this._resolveResponse = resolver;
  },

  showEnd() {
    this.showScreen('screen-end');
  }
};
