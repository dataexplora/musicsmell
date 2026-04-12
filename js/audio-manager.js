/**
 * Audio Manager — Loads and plays audio files from a user-selected folder.
 * Works in file:// mode using FileReader + createObjectURL.
 */
const AudioManager = {
  /** @type {Map<string, string>} filename → objectURL */
  _files: new Map(),
  _ready: false,

  /**
   * Load audio files from a FileList (from folder picker).
   * @param {FileList} fileList
   * @returns {Promise<string[]>} List of loaded filenames
   */
  async loadFromFiles(fileList) {
    this._files.clear();
    this._ready = false;

    const validExtensions = ['.wav', '.mp3', '.ogg', '.m4a'];
    const audioFiles = Array.from(fileList).filter(file =>
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (audioFiles.length === 0) {
      throw new Error('Δεν βρέθηκαν αρχεία ήχου στον φάκελο');
    }

    // Create object URLs and preload each file
    const loadPromises = audioFiles.map(file => {
      const objectURL = URL.createObjectURL(file);
      this._files.set(file.name, objectURL);

      return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', () => {
          console.warn(`Αποτυχία φόρτωσης: ${file.name}`);
          resolve(); // Don't fail the whole batch
        }, { once: true });
        audio.src = objectURL;
        audio.load();
      });
    });

    await Promise.all(loadPromises);
    this._ready = true;
    return this.getLoadedFiles();
  },

  /**
   * Play an audio file by name.
   * Handles filenames with or without extension (e.g. "Pink noise" → "Pink noise.wav").
   * @param {string} filename
   * @returns {HTMLAudioElement|null}
   */
  play(filename) {
    let url = this._files.get(filename);

    // Try adding .wav if no extension provided
    if (!url && !filename.includes('.')) {
      url = this._files.get(filename + '.wav');
    }

    if (!url) {
      console.warn(`Δεν βρέθηκε ο ήχος: ${filename}`);
      return null;
    }

    const audio = new Audio(url);
    audio.play().catch(err => console.error('Audio playback error:', err));
    return audio;
  },

  /**
   * Stop an audio element.
   * @param {HTMLAudioElement|null} audio
   */
  stop(audio) {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  },

  isReady() {
    return this._ready;
  },

  getLoadedFiles() {
    return Array.from(this._files.keys());
  }
};
