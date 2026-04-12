/**
 * CSV Parser — Parses experiment trial CSV files.
 */
const CSVParser = {
  REQUIRED_COLUMNS: [
    'ParticipantID', 'Session', 'TrialNum', 'TargetType',
    'Target', 'PrimeType', 'Prime', 'Congruency'
  ],

  /**
   * Parse CSV text into an array of trial objects.
   * @param {string} csvText - Raw CSV content
   * @returns {Array<Object>} Array of trial objects
   */
  parse(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Το CSV αρχείο είναι κενό');
    }

    const headers = lines[0].split(',').map(h => h.trim());

    // Validate required columns
    const missing = this.REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missing.length > 0) {
      throw new Error(`Λείπουν στήλες: ${missing.join(', ')}`);
    }

    const trials = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const trial = {};
      headers.forEach((header, index) => {
        trial[header] = values[index] || '';
      });

      trials.push(trial);
    }

    if (trials.length === 0) {
      throw new Error('Δεν βρέθηκαν trials στο CSV');
    }

    return trials;
  }
};
