import { describe, it, expect } from 'vitest'
import { parseDose, checkAndUpdateDailyDose } from './medUtils'

describe('medUtils', () => {
  describe('parseDose', () => {
    it('should parse integer strings', () => {
      expect(parseDose('1')).toBe(1)
      expect(parseDose('2')).toBe(2)
    })

    it('should parse decimal strings', () => {
      expect(parseDose('0.5')).toBe(0.5)
      expect(parseDose('1.5')).toBe(1.5)
    })

    it('should parse fraction strings', () => {
      expect(parseDose('1/2')).toBe(0.5)
      expect(parseDose('1/4')).toBe(0.25)
      expect(parseDose('3/4')).toBe(0.75)
    })

    it('should return 0 for empty or invalid input', () => {
      expect(parseDose('')).toBe(0)
      expect(parseDose(null)).toBe(0)
      expect(parseDose(undefined)).toBe(0)
    })
  })

  describe('checkAndUpdateDailyDose', () => {
    it('should not update if date is the same', () => {
      const today = new Date().toDateString()
      const items = [{ name: 'Med A', count: 10, dose: '1' }]
      
      const result = checkAndUpdateDailyDose(items, today)
      
      expect(result.updated).toBe(false)
      expect(result.updatedItems).toEqual(items)
      expect(result.newDate).toBe(today)
    })

    it('should update counts if date is different', () => {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const today = new Date().toDateString()
      
      const items = [
        { name: 'Med A', count: 10, dose: '1' },
        { name: 'Med B', count: 5, dose: '0.5' },
        { name: 'Med C', count: 2, dose: '1/4' }
      ]
      
      const result = checkAndUpdateDailyDose(items, yesterday)
      
      expect(result.updated).toBe(true)
      expect(result.newDate).toBe(today)
      
      expect(result.updatedItems[0].count).toBe(9)   // 10 - 1
      expect(result.updatedItems[1].count).toBe(4.5) // 5 - 0.5
      expect(result.updatedItems[2].count).toBe(1.75) // 2 - 0.25
    })

    it('should not reduce count below zero', () => {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const items = [{ name: 'Med A', count: 0.5, dose: '1' }]
      
      const result = checkAndUpdateDailyDose(items, yesterday)
      
      expect(result.updatedItems[0].count).toBe(0)
    })
  })
})