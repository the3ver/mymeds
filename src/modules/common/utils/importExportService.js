import * as dataService from './dataService';

/**
 * Prepares the data for export.
 * @returns {Promise<{exportDataContent: string, exportFileName: string}>}
 */
export async function prepareExport() {
  const data = await dataService.exportData();
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
 * @returns {Promise<{success: boolean, stats: object|null, error: string|null}>}
 */
export async function processImport(fileContent) {
  try {
    const data = JSON.parse(fileContent);

    // Basic validation
    if (!data || typeof data !== 'object' || !data.meds || !data.calendar) {
      return { success: false, stats: null, error: 'Invalid file format.' };
    }

    const currentMeds = await dataService.getMeds();
    const currentCalendar = await dataService.getCalendarEntries();

    const stats = {
      date: data.exportDate ? new Date(data.exportDate).toLocaleString() : 'N/A',
      medsCount: data.meds.length,
      currentMedsCount: currentMeds.length,
      calendarCount: data.calendar.length,
      currentCalendarCount: currentCalendar.length,
      data: data // Pass the full data for the final confirmation step
    };

    return { success: true, stats, error: null };
  } catch (error) {
    console.error('Import processing error:', error);
    return { success: false, stats: null, error: 'Error parsing the file.' };
  }
}

/**
 * Finalizes the import process by saving the data.
 * @param {object} data - The validated data object from processImport.
 * @returns {Promise<boolean>} - True if successful.
 */
export async function confirmImport(data) {
  return dataService.importData(data);
}
