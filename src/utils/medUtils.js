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

// Check if a day has passed and update counts
export const checkAndUpdateDailyDose = (savedItems, lastUpdateDate, currentDate = new Date()) => {
  const todayStr = currentDate.toDateString()

  if (lastUpdateDate !== todayStr) {
    // Calculate days passed
    const lastDate = new Date(lastUpdateDate)
    const diffTime = Math.abs(currentDate - lastDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
    
    // If diffDays is 0 (same day) or somehow negative/invalid, don't update
    // But since we checked string equality first, diffDays should be at least 1 if dates differ
    // However, to be safe and handle potential timezone edge cases or manual date manipulation:
    // We only update if diffDays >= 1
    
    if (diffDays >= 1) {
      const updatedItems = savedItems.map(item => {
        const dose = parseDose(item.dose)
        const totalDeduction = dose * diffDays
        
        let newCount = parseFloat(item.count) - totalDeduction
        // Ensure count doesn't go below 0
        if (newCount < 0) newCount = 0
        
        // Format to max 2 decimal places to avoid floating point errors
        return {
          ...item,
          count: Math.round(newCount * 100) / 100
        }
      })
      
      return { updatedItems, newDate: todayStr, updated: true }
    }
  }
  
  return { updatedItems: savedItems, newDate: lastUpdateDate, updated: false }
}

// Calculate days remaining for an item
export const calculateDaysRemaining = (item) => {
  const dose = parseDose(item.dose)
  if (!dose || dose <= 0) return null
  return Math.floor(item.count / dose)
}

// Determine status color based on remaining days
export const getStatusColor = (daysRemaining, yellowLimit, redLimit) => {
  if (daysRemaining === null) return null
  if (daysRemaining <= redLimit) return 'error'
  if (daysRemaining <= yellowLimit) return 'warning'
  return null
}