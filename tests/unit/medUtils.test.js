import { describe, it, expect } from 'vitest';
import { checkAndUpdateDailyDose } from '../../src/modules/meds/utils/medUtils';

describe('checkAndUpdateDailyDose', () => {

  const today = new Date('2023-10-27T10:00:00.000Z');
  const yesterday = new Date('2023-10-26T10:00:00.000Z');
  const twoDaysAgo = new Date('2023-10-25T10:00:00.000Z');

  const mockMeds = [
    { name: 'Aspirin', count: 10, dose: '1' },
    { name: 'Ibuprofen', count: 20, dose: '2-0-2' }, // Total dose: 4
    { name: 'Vitamin C', count: 5, dose: '0' },
    { name: 'Paracetamol', count: 1, dose: '1' },
  ];

  it('should not update items if last update was today', () => {
    const { updated, updatedItems, newDate, deductions } = checkAndUpdateDailyDose(
      mockMeds,
      today.toDateString(),
      today
    );

    expect(updated).toBe(false);
    expect(updatedItems).toEqual(mockMeds);
    expect(newDate).toBe(today.toDateString());
    expect(deductions).toEqual({});
  });

  it('should update items and calculate deductions for one day difference', () => {
    const { updated, updatedItems, newDate, deductions } = checkAndUpdateDailyDose(
      mockMeds,
      yesterday.toDateString(),
      today
    );

    expect(updated).toBe(true);
    expect(newDate).toBe(today.toDateString());

    // Check deductions
    expect(deductions).toEqual({
      'Aspirin': 1,
      'Ibuprofen': 4,
      'Paracetamol': 1,
    });

    // Check updated counts
    expect(updatedItems.find(m => m.name === 'Aspirin').count).toBe(9); // 10 - 1
    expect(updatedItems.find(m => m.name === 'Ibuprofen').count).toBe(16); // 20 - 4
    expect(updatedItems.find(m => m.name === 'Vitamin C').count).toBe(5); // No change
    expect(updatedItems.find(m => m.name === 'Paracetamol').count).toBe(0); // 1 - 1
  });

  it('should update items and calculate deductions for multiple days', () => {
    const { updated, updatedItems, newDate, deductions } = checkAndUpdateDailyDose(
      mockMeds,
      twoDaysAgo.toDateString(),
      today
    );

    const diffDays = 2;
    expect(updated).toBe(true);
    expect(newDate).toBe(today.toDateString());

    // Check deductions
    expect(deductions).toEqual({
      'Aspirin': 1 * diffDays,
      'Ibuprofen': 4 * diffDays,
      'Paracetamol': 1 * diffDays,
    });

    // Check updated counts
    expect(updatedItems.find(m => m.name === 'Aspirin').count).toBe(10 - (1 * diffDays));
    expect(updatedItems.find(m => m.name === 'Ibuprofen').count).toBe(20 - (4 * diffDays));
    expect(updatedItems.find(m => m.name === 'Vitamin C').count).toBe(5);
  });

  it('should not let count go below zero', () => {
    const lowStockMeds = [{ name: 'Aspirin', count: 1, dose: '2' }];
    const { updatedItems, deductions } = checkAndUpdateDailyDose(
      lowStockMeds,
      yesterday.toDateString(),
      today
    );

    expect(deductions['Aspirin']).toBe(2);
    expect(updatedItems.find(m => m.name === 'Aspirin').count).toBe(0);
  });

  it('should handle empty items array', () => {
    const { updated, updatedItems, deductions } = checkAndUpdateDailyDose(
      [],
      yesterday.toDateString(),
      today
    );

    expect(updated).toBe(true);
    expect(updatedItems).toEqual([]);
    expect(deductions).toEqual({});
  });
  
  it('should handle floating point doses and counts correctly', () => {
    const floatMeds = [{ name: 'TestMed', count: 5.5, dose: '0.5-0-0.5' }]; // dose = 1
    const { updatedItems, deductions } = checkAndUpdateDailyDose(
      floatMeds,
      yesterday.toDateString(),
      today
    );

    expect(deductions['TestMed']).toBe(1);
    expect(updatedItems.find(m => m.name === 'TestMed').count).toBe(4.5);
  });

  it('should handle missing lastUpdateDate by setting it to today and not deducting', () => {
    const { updated, updatedItems, newDate, deductions } = checkAndUpdateDailyDose(
      mockMeds,
      undefined, // Simulate missing date
      today
    );

    // It should mark as "updated" because the date is being fixed
    expect(updated).toBe(true); 
    // The items themselves should not be changed
    expect(updatedItems).toEqual(mockMeds); 
    // The new date should be set to today
    expect(newDate).toBe(today.toDateString());
    // No deductions should be calculated
    expect(deductions).toEqual({});
  });
});
