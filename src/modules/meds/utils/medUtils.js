// Helper to parse dose string to number
export const parseDose = (doseStr) => {
  if (!doseStr) return 0
  
  // Handle pattern like "1-0-1" or "1-0-0-1"
  if (doseStr.includes('-')) {
    const parts = doseStr.split('-')
    let sum = 0
    for (const part of parts) {
      sum += parseSingleDose(part.trim())
    }
    return sum
  }
  
  return parseSingleDose(doseStr)
}

// Helper to parse a single number, fraction or decimal
const parseSingleDose = (val) => {
  if (!val) return 0
  if (val.includes('/')) {
    const [numerator, denominator] = val.split('/')
    return parseFloat(numerator) / parseFloat(denominator)
  }
  // Replace comma with dot for decimal parsing
  const normalized = val.replace(',', '.')
  return parseFloat(normalized) || 0
}

const WEEKDAY_MAP = {
  mo: 1, mon: 1, montag: 1, monday: 1, '1': 1,
  di: 2, tue: 2, dienstag: 2, tuesday: 2, '2': 2,
  mi: 3, wed: 3, mittwoch: 3, wednesday: 3, '3': 3,
  do: 4, thu: 4, donnerstag: 4, thursday: 4, '4': 4,
  fr: 5, fri: 5, freitag: 5, friday: 5, '5': 5,
  sa: 6, sat: 6, samstag: 6, saturday: 6, '6': 6,
  so: 0, sun: 0, sonntag: 0, sunday: 0, '0': 0, '7': 0
};

export const normalizeWeekday = (day) => {
  if (typeof day === 'number') return day % 7;
  const str = String(day).toLowerCase().trim();
  return WEEKDAY_MAP[str] !== undefined ? WEEKDAY_MAP[str] : -1;
};

const calculateItemDeduction = (item, lastDate, todayDate, diffDays) => {
  const dose = parseDose(item.dose);
  if (!dose || dose <= 0) return 0;

  const schedule = item.schedule;
  if (!schedule || schedule.type === 'daily') {
    return dose * diffDays;
  }

  if (schedule.type === 'weekly') {
    if (!Array.isArray(schedule.days) || schedule.days.length === 0) {
      return 0;
    }
    const targetDays = new Set(schedule.days.map(normalizeWeekday));
    let matchingDays = 0;
    const cursor = new Date(lastDate);
    cursor.setDate(cursor.getDate() + 1);

    while (cursor <= todayDate) {
      if (targetDays.has(cursor.getDay())) {
        matchingDays++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dose * matchingDays;
  }

  if (schedule.type === 'interval') {
    const intervalDays = schedule.intervalDays && schedule.intervalDays > 0 ? schedule.intervalDays : 1;
    if (schedule.startDate) {
      const start = new Date(schedule.startDate);
      start.setHours(0, 0, 0, 0);
      let occurrences = 0;
      const cursor = new Date(lastDate);
      cursor.setDate(cursor.getDate() + 1);

      while (cursor <= todayDate) {
        const diffFromStart = Math.round((cursor - start) / (1000 * 60 * 60 * 24));
        if (diffFromStart >= 0 && diffFromStart % intervalDays === 0) {
          occurrences++;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      return dose * occurrences;
    } else {
      return dose * Math.floor(diffDays / intervalDays);
    }
  }

  return dose * diffDays;
};

// Check if a day has passed and update counts
export const checkAndUpdateDailyDose = (savedItems, lastUpdateDate, currentDate = new Date()) => {
  const todayStr = currentDate.toDateString()
  const deductions = {} // Map of item name -> amount deducted

  // Handle case where lastUpdateDate is missing (e.g., from older data)
  if (!lastUpdateDate) {
    return { updatedItems: savedItems, newDate: todayStr, updated: true, deductions: {} };
  }

  if (lastUpdateDate !== todayStr) {
    // Normalize dates to midnight to ignore time differences
    const lastDate = new Date(lastUpdateDate)
    lastDate.setHours(0, 0, 0, 0)
    
    const todayDate = new Date(currentDate)
    todayDate.setHours(0, 0, 0, 0)
    
    const diffTime = Math.abs(todayDate - lastDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
    
    if (diffDays >= 1) {
      const updatedItems = savedItems.map(item => {
        const totalDeduction = calculateItemDeduction(item, lastDate, todayDate, diffDays);
        
        if (totalDeduction > 0) {
          deductions[item.name] = totalDeduction
        }
        
        let newCount = parseFloat(item.count) - totalDeduction
        // Ensure count doesn't go below 0
        if (newCount < 0) newCount = 0
        
        // Format to max 2 decimal places to avoid floating point errors
        return {
          ...item,
          count: Math.round(newCount * 100) / 100
        }
      })
      
      return { updatedItems, newDate: todayStr, updated: true, deductions }
    }
  }
  
  return { updatedItems: savedItems, newDate: lastUpdateDate, updated: false, deductions }
}

// Calculate days remaining for an item
export const calculateDaysRemaining = (item) => {
  const dose = parseDose(item.dose)
  if (!dose || dose <= 0) return null
  if (!item.count || item.count <= 0) return 0

  const schedule = item.schedule
  if (schedule && schedule.type === 'weekly') {
    const daysCount = Array.isArray(schedule.days) && schedule.days.length > 0 ? schedule.days.length : 1
    const dailyAverage = (dose * daysCount) / 7
    return Math.floor(item.count / dailyAverage)
  }

  if (schedule && schedule.type === 'interval') {
    const intervalDays = schedule.intervalDays && schedule.intervalDays > 0 ? schedule.intervalDays : 1
    const dailyAverage = dose / intervalDays
    return Math.floor(item.count / dailyAverage)
  }

  return Math.floor(item.count / dose)
}

// Determine status color based on remaining days
export const getStatusColor = (daysRemaining, yellowLimit, redLimit) => {
  if (daysRemaining === null) return null
  if (daysRemaining <= redLimit) return 'error'
  if (daysRemaining <= yellowLimit) return 'warning'
  return null
}
