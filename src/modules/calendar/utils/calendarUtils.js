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

const ICS_TIMED_DURATION_MINUTES = 60

function formatIcsLocalDateTime(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
}

function icsStartLines(entry) {
  if (entry.time) {
    const [y, m, d] = entry.date.split('-').map(Number)
    const [hh, mm] = entry.time.split(':').map(Number)
    const start = new Date(y, m - 1, d, hh, mm)
    const end = new Date(start.getTime() + ICS_TIMED_DURATION_MINUTES * 60000)
    // Floating local time (no Z): calendar apps use the device time zone
    return [`DTSTART:${formatIcsLocalDateTime(start)}`, `DTEND:${formatIcsLocalDateTime(end)}`]
  }
  const date = new Date(entry.date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return [`DTSTART;VALUE=DATE:${year}${month}${day}`] // All day event
}

// Descending by date. Same day: quarter markers last, all-day entries first, then later times first.
export function compareEntries(a, b) {
  const byDate = new Date(b.date) - new Date(a.date)
  if (byDate !== 0) return byDate
  const rank = (e) => (e.type === 'quarter' ? 2 : e.time ? 1 : 0)
  const byRank = rank(a) - rank(b)
  if (byRank !== 0) return byRank
  return (b.time || '').localeCompare(a.time || '')
}

export function formatEntryTime(time, locale) {
  if (!time) return ''
  const [hh, mm] = time.split(':').map(Number)
  const isDe = locale === 'de'
  return new Date(2000, 0, 1, hh, mm).toLocaleTimeString(isDe ? 'de-DE' : 'en-US', {
    hour: isDe ? '2-digit' : 'numeric',
    minute: '2-digit'
  })
}

export function createDetailedCalendarEvent(entry) {

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
    ...icsStartLines(entry),
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

export function getQuarterKey(dateString) {
  if (!dateString) return ''
  if (typeof dateString === 'string') {
    const match = dateString.match(/^(\d{4})-(\d{2})/)
    if (match) {
      const year = match[1]
      const month = parseInt(match[2], 10)
      if (month >= 1 && month <= 12) {
        const quarter = Math.floor((month - 1) / 3) + 1
        return `${year}-Q${quarter}`
      }
    }
  }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return `${year}-Q${quarter}`
}

function normalizeLocation(location) {
  return location ? location.trim().toLowerCase() : ''
}

export function resolveEffectiveReferralStatus(entry, allEntries = []) {
  if (!entry || entry.type !== 'doctor' || !entry.needsReferral) {
    return null
  }

  const normalizedLocation = normalizeLocation(entry.location)
  if (!normalizedLocation) {
    return entry.referralStatus || 'needed'
  }

  const quarterKey = getQuarterKey(entry.date)

  const entriesPool = allEntries.includes(entry) ? allEntries : [entry, ...allEntries]

  const sameQuarterAppointments = entriesPool.filter((e) => {
    if (!e || e.type !== 'doctor' || !e.needsReferral) return false
    return normalizeLocation(e.location) === normalizedLocation && getQuarterKey(e.date) === quarterKey
  })

  if (sameQuarterAppointments.some((e) => e.referralStatus === 'submitted')) {
    return 'submitted'
  }
  return entry.referralStatus || 'needed'
}

export function getLocalDateString(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isPendingReferral(entry, allEntries = [], todayStr = getLocalDateString()) {
  if (!entry || entry.type !== 'doctor' || !entry.needsReferral) return false
  if (entry.date < todayStr) return false
  return resolveEffectiveReferralStatus(entry, allEntries) === 'needed'
}