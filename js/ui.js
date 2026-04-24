/**
 * UI — Renders experiment phases on the participant screen.
 */
const UI = {
  /** Fixed order — same in UI and CSV export. Greek neutral adjectives. */
  DIMENSIONS: ['Φωτεινό', 'Οξύ', 'Γεμάτο', 'Ζεστό', 'Γλυκό', 'Φρέσκο'],

  /** Target type instructions */
  TARGET_INSTRUCTIONS: {
    Auditory: 'Αξιολογήστε το ηχόχρωμα',
    Olfactory: 'Αξιολογήστε το άρωμα'
  },

  /** @type {HTMLElement} */
  _content: null,

  /** @type {Function|null} */
  _resolveResponse: null,

  /** @type {string|null} Current trial's target type */
  _currentTargetType: null,

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
        this._currentTargetType = trial.TargetType;
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

    if (type === 'Auditory') {
      const img = document.createElement('img');
      img.className = 'stimulus-icon';
      img.src = 'public/ear_transparent_white.png';
      img.alt = '';
      this._content.appendChild(img);
    } else if (type === 'Olfactory') {
      const img = document.createElement('img');
      img.className = 'stimulus-icon';
      img.src = 'public/nose_transparent_white.png';
      img.alt = '';
      this._content.appendChild(img);
    } else if (type === 'Lexical') {
      const el = document.createElement('div');
      el.className = 'lexical-prime';
      el.textContent = value;
      this._content.appendChild(el);
    }
  },

  _renderBlank() {
    this._content.innerHTML = '';
  },

  /**
   * Render instruction + 6 slider scales (fixed order) + confirm button.
   */
  _renderResponse() {
    this._content.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'slider-container';

    // Instruction: what to rate
    const instruction = document.createElement('div');
    instruction.className = 'response-instruction';
    instruction.textContent = this.TARGET_INSTRUCTIONS[this._currentTargetType] || '';
    container.appendChild(instruction);

    const sliders = {};

    // Create one slider row per dimension
    this.DIMENSIONS.forEach(dim => {
      const row = document.createElement('div');
      row.className = 'slider-row inactive';

      const label = document.createElement('span');
      label.className = 'slider-label';
      label.textContent = dim;

      const input = document.createElement('input');
      input.type = 'range';
      input.className = 'slider-input';
      input.min = '0';
      input.max = '100';
      input.value = '0';

      const rangeLabels = document.createElement('div');
      rangeLabels.className = 'slider-range-labels';
      rangeLabels.innerHTML = '<span>Λίγο</span><span>Πολύ</span>';

      input.addEventListener('input', () => {
        const val = parseInt(input.value);
        row.classList.toggle('inactive', val === 0);
        this._updateConfirmButton(sliders, confirmBtn);
      });

      sliders[dim] = input;
      row.appendChild(label);
      row.appendChild(input);
      row.appendChild(rangeLabels);
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
        this.DIMENSIONS.forEach(dim => {
          values[dim] = parseInt(sliders[dim].value);
        });
        const resolve = this._resolveResponse;
        this._resolveResponse = null;
        resolve(values);
      }
    });

    container.appendChild(confirmBtn);
    this._content.appendChild(container);
  },

  _updateConfirmButton(sliders, btn) {
    const anyActive = this.DIMENSIONS.some(
      dim => parseInt(sliders[dim].value) > 0
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
