/**
 * Prepares the data for export by creating a JSON string and a filename.
 * @param {{meds: Array, calendar: Array, lastDoseUpdate: string}} dataToExport - The decrypted data from the app state.
 * @returns {{exportDataContent: string, exportFileName: string}}
 */
export function prepareExport(dataToExport) {
  const data = {
    exportDate: new Date().toISOString(),
    meds: dataToExport.meds,
    calendar: dataToExport.calendar,
    lastDoseUpdate: dataToExport.lastDoseUpdate,
  };
  const exportDataContent = JSON.stringify(data, null, 2);

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const exportFileName = `mymeds_daten_${day}.${month}.${year}.json`;

  return { exportDataContent, exportFileName };
}

/**
 * Processes the content of an imported file.
 * @param {string} fileContent - The JSON string from the imported file.
 * @returns {{success: boolean, stats: object|null, error: string|null}}
 */
export function processImport(fileContent) {
  try {
    const data = JSON.parse(fileContent);

    // Basic validation
    if (!data || typeof data !== 'object' || !Array.isArray(data.meds) || !Array.isArray(data.calendar)) {
      return { success: false, stats: null, error: 'Invalid file format.' };
    }

    const stats = {
      date: data.exportDate ? new Date(data.exportDate).toLocaleString() : 'N/A',
      medsCount: data.meds.length,
      calendarCount: data.calendar.length,
      data: { 
        meds: data.meds, 
        calendar: data.calendar,
        // Ensure lastDoseUpdate is present, default to today if not
        lastDoseUpdate: data.lastDoseUpdate || new Date().toDateString()
      }
    };

    return { success: true, stats, error: null };
  } catch (error) {
    console.error('Import processing error:', error);
    return { success: false, stats: null, error: 'Error parsing the file.' };
  }
}
