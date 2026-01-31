export function createCalendarEvent(title, description, date, url) {
  // Format date to YYYYMMDD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateFormatted = `${year}${month}${day}`

  // Create ICS content
  // Using a fixed UID allows calendar apps to identify this as an update to an existing event
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyMeds//NONSGML v1.0//EN',
    'BEGIN:VEVENT',
    `UID:restock-reminder@mymeds.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${dateFormatted}`, // All day event
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    url ? `URL:${url}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')

  const file = new File([icsContent], 'mymeds_reminder.ics', { type: 'text/calendar' })

  // Helper function for download fallback
  const downloadFile = () => {
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'mymeds_reminder.ics'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  // Try native sharing (mobile)
  if (navigator.canShare && navigator.share) {
    const shareData = {
      files: [file],
      title: title,
      text: description
    }
    
    if (navigator.canShare(shareData)) {
      navigator.share(shareData).catch((err) => {
        console.error('Share failed:', err)
        // Fallback to download if share fails (e.g. user cancelled or not supported)
        downloadFile()
      })
    } else {
      downloadFile()
    }
  } else {
    // Fallback for Desktop or browsers without share API
    downloadFile()
  }
}