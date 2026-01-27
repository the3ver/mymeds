// Helper to parse dose string to number
export const parseDose = (doseStr) => {
  if (!doseStr) return 0
  if (doseStr.includes('/')) {
    const [numerator, denominator] = doseStr.split('/')
    return parseFloat(numerator) / parseFloat(denominator)
  }
  return parseFloat(doseStr)
}

// Check if a day has passed and update counts
export const checkAndUpdateDailyDose = (savedItems, lastUpdateDate, currentDate = new Date()) => {
  const today = currentDate.toDateString()

  if (lastUpdateDate !== today) {
    const updatedItems = savedItems.map(item => {
      const dose = parseDose(item.dose)
      let newCount = parseFloat(item.count) - dose
      // Ensure count doesn't go below 0
      if (newCount < 0) newCount = 0
      
      // Format to max 2 decimal places to avoid floating point errors
      return {
        ...item,
        count: Math.round(newCount * 100) / 100
      }
    })
    
    return { updatedItems, newDate: today, updated: true }
  }
  
  return { updatedItems: savedItems, newDate: lastUpdateDate, updated: false }
}