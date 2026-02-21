import { describe, it, expect } from 'vitest'
import { prepareExport, processImport } from '../../src/modules/common/utils/importExportService'

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
};

const mockDataToExport = {
  meds: [fullMedData, minimalMedData],
  calendar: [fullCalendarData, minimalCalendarData]
};

describe('importExportService', () => {

  // --- EXPORT TESTS ---
  describe('prepareExport', () => {
    it('should take data and return formatted content and filename', () => {
      // Act
      const { exportDataContent, exportFileName } = prepareExport(mockDataToExport);

      // Assert
      const parsedContent = JSON.parse(exportDataContent);
      expect(parsedContent.meds).toEqual(mockDataToExport.meds);
      expect(parsedContent.calendar).toEqual(mockDataToExport.calendar);
      expect(parsedContent.exportDate).toBeDefined();
      expect(exportFileName).toMatch(/mymeds_daten_\d{2}\.\d{2}\.\d{4}\.json/);
    });
  });

  // --- IMPORT TESTS ---
  describe('processImport', () => {
    it('should process a valid file content and return stats and data', () => {
      // Arrange
      const fileContent = JSON.stringify({ exportDate: new Date().toISOString(), ...mockDataToExport });

      // Act
      const result = processImport(fileContent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.stats).toEqual({
        date: expect.any(String),
        medsCount: 2,
        calendarCount: 2,
        data: mockDataToExport
      });
    });

    it('should return an error for invalid JSON', () => {
      const result = processImport('{ not json }');
      expect(result.success).toBe(false);
      expect(result.error).toContain('parsing');
    });

    it('should return an error for missing "meds" property', () => {
      const invalidData = { calendar: [] };
      const result = processImport(JSON.stringify(invalidData));
      expect(result.success).toBe(false);
      expect(result.error).toContain('format');
    });

    it('should return an error for missing "calendar" property', () => {
      const invalidData = { meds: [] };
      const result = processImport(JSON.stringify(invalidData));
      expect(result.success).toBe(false);
      expect(result.error).toContain('format');
    });
  });
});
