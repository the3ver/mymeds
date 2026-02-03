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

export function createDetailedCalendarEvent(entry) {
  const date = new Date(entry.date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateFormatted = `${year}${month}${day}`

  // Build description from all available fields
  let description = ''
  
  if (entry.type === 'doctor') {
    if (entry.doctor) description += `Doctor: ${entry.doctor}\\n`
    if (entry.doctorType) description += `Type: ${entry.doctorType}\\n`
    if (entry.location) description += `Location: ${entry.location}\\n`
    if (entry.treatments) description += `Treatments: ${entry.treatments}\\n`
  } else if (entry.type === 'vaccination') {
    if (entry.agent) description += `Agent: ${entry.agent}\\n`
    if (entry.method) description += `Method: ${entry.method}\\n`
    if (entry.bodyPart) description += `Body Part: ${entry.bodyPart}\\n`
  } else if (entry.type === 'illness') {
    if (entry.pathogen) description += `Pathogen: ${entry.pathogen}\\n`
    if (entry.symptoms) description += `Symptoms: ${entry.symptoms}\\n`
    if (entry.endDate) description += `End Date: ${entry.endDate}\\n`
  } else if (entry.type === 'note') {
    if (entry.endDate) description += `End Date: ${entry.endDate}\\n`
  }

  if (entry.notes) {
    description += `\\nNotes:\\n${entry.notes.replace(/\n/g, '\\n')}`
  }

  // Create ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyMeds//NONSGML v1.0//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@mymeds.app`, // Unique ID for each event
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${dateFormatted}`, // All day event
    `SUMMARY:${entry.title}`,
    `DESCRIPTION:${description}`,
    entry.location ? `LOCATION:${entry.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')

  const file = new File([icsContent], 'mymeds_event.ics', { type: 'text/calendar' })

  // Helper function for download fallback
  const downloadFile = () => {
    const url = URL.createObjectURL(file)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  // Try native sharing (mobile)
  if (navigator.canShare && navigator.share) {
    const shareData = {
      files: [file],
      title: entry.title,
      text: description.replace(/\\n/g, '\n')
    }
    
    if (navigator.canShare(shareData)) {
      navigator.share(shareData).catch((err) => {
        console.error('Share failed:', err)
        downloadFile()
      })
    } else {
      downloadFile()
    }
  } else {
    downloadFile()
  }
}