/**
 * Export — Generates and downloads the results CSV.
 */
const Export = {
  COLUMNS: [
    'ParticipantID', 'Session', 'TrialNum', 'TargetType', 'Target',
    'PrimeType', 'Prime', 'Congruency',
    'Λιακάδα', 'Αιχμή', 'Μάζα', 'Θαλπωρή', 'Αύρα', 'Νέκταρ',
    'ResponseTimeMs'
  ],

  /**
   * Build a CSV string from results.
   * @param {Array<Object>} results
   * @returns {string}
   */
  buildCSV(results) {
    const header = this.COLUMNS.join(',');
    const rows = results.map(r =>
      this.COLUMNS.map(col => {
        const val = r[col] ?? '';
        // Escape values that contain commas
        return String(val).includes(',') ? `"${val}"` : val;
      }).join(',')
    );
    return header + '\n' + rows.join('\n') + '\n';
  },

  /**
   * Trigger a CSV file download.
   * @param {Array<Object>} results
   * @param {string} participantId
   * @param {string} session
   */
  download(results, participantId, session) {
    const csv = this.buildCSV(results);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `results_P${participantId}_S${session}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  },

  /**
   * Backup results to localStorage in case of unexpected crash.
   * @param {Array<Object>} results
   */
  backupToLocalStorage(results) {
    try {
      localStorage.setItem('musicsmell_backup', JSON.stringify({
        timestamp: new Date().toISOString(),
        results
      }));
    } catch (e) {
      // localStorage might not be available in file:// mode on some browsers
    }
  }
};
