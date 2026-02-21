import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as dataService from '../../src/modules/common/utils/dataService'
import { prepareExport, processImport, confirmImport } from '../../src/modules/common/utils/importExportService'

// Mock the dataService
vi.mock('../../src/modules/common/utils/dataService')

// --- Test Data ---
const fullMedData = {
  name: 'Aspirin',
  ingredient: 'Acetylsalicylic Acid',
  count: '100',
  packageSize: '100',
  dose: '1-0-1',
  color: 'blue'
};

const minimalMedData = {
  name: 'Ibuprofen',
  count: '50',
  dose: '1',
  // Missing optional fields: ingredient, packageSize, color
};

const fullCalendarData = {
  date: '2024-01-01',
  title: 'Doctor Visit',
  type: 'doctor',
  doctor: 'Dr. Smith',
  notes: 'Annual checkup'
};

const minimalCalendarData = {
  date: '2024-02-01',
  title: 'Dentist',
  type: 'doctor'
  // Missing all optional fields
};

const mockExportData = {
  meds: [fullMedData, minimalMedData],
  calendar: [fullCalendarData, minimalCalendarData]
};

describe('importExportService', () => {

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  // --- EXPORT TESTS ---
  describe('prepareExport', () => {
    it('should call dataService.exportData and return formatted content', () => {
      // Arrange
      dataService.exportData.mockReturnValue(mockExportData)

      // Act
      const { exportDataContent, exportFileName } = prepareExport()

      // Assert
      expect(dataService.exportData).toHaveBeenCalledOnce()
      expect(JSON.parse(exportDataContent)).toEqual({
        exportDate: expect.any(String), // The date is generated inside, so we check for type
        ...mockExportData
      })
      expect(exportFileName).toMatch(/mymeds_daten_\d{2}\.\d{2}\.\d{4}\.json/)
    })
  })

  // --- IMPORT TESTS ---
  describe('processImport', () => {
    it('should process a valid file content and return stats', () => {
      // Arrange
      const fileContent = JSON.stringify({ exportDate: new Date().toISOString(), ...mockExportData })
      dataService.getMeds.mockReturnValue([{ name: 'Old Med', count: 10, dose: '1' }])
      dataService.getCalendarEntries.mockReturnValue([{ title: 'Old Entry' }])

      // Act
      const result = processImport(fileContent)

      // Assert
      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(result.stats).toEqual({
        date: expect.any(String),
        medsCount: 2,
        currentMedsCount: 1,
        calendarCount: 2,
        currentCalendarCount: 1,
        data: expect.any(Object)
      })
      expect(result.stats.data.meds).toHaveLength(2)
    })

    it('should return an error for invalid JSON', () => {
      const result = processImport('{ not json }')
      expect(result.success).toBe(false)
      expect(result.error).toContain('parsing')
    })

    it('should return an error for missing "meds" property', () => {
      const invalidData = { calendar: [] }
      const result = processImport(JSON.stringify(invalidData))
      expect(result.success).toBe(false)
      expect(result.error).toContain('format')
    })

    it('should return an error for missing "calendar" property', () => {
      const invalidData = { meds: [] }
      const result = processImport(JSON.stringify(invalidData))
      expect(result.success).toBe(false)
      expect(result.error).toContain('format')
    })
  })

  describe('confirmImport', () => {
    it('should call dataService.importData with the provided data', () => {
      // Arrange
      const dataToImport = { meds: [fullMedData], calendar: [fullCalendarData] }
      dataService.importData.mockReturnValue(true)

      // Act
      const result = confirmImport(dataToImport)

      // Assert
      expect(dataService.importData).toHaveBeenCalledWith(dataToImport)
      expect(result).toBe(true)
    })
  })
})
