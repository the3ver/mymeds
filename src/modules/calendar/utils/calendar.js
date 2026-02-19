/**
 * Erstellt eine .ics Datei und löst den Download aus.
 * @param {Object} event
 * @param {string} event.title - Titel des Termins
 * @param {string} event.description - Beschreibung
 * @param {Date} event.start - Startdatum (Date Objekt)
 * @param {number} event.durationMinutes - Dauer in Minuten
 */
export function downloadIcsEvent({ title, description, start, durationMinutes = 60 }) {
  // Formatierung für iCalendar: YYYYMMDDTHHmmSSZ (UTC)
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');

  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'termin.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}