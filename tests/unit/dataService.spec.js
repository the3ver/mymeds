import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dataService from '../../src/modules/common/utils/dataService';
import * as dbAdapter from '../../src/modules/common/utils/indexedDbAdapter';
import * as crypto from '../../src/modules/common/utils/cryptoService';
import { checkAndUpdateDailyDose } from '../../src/modules/meds/utils/medUtils';

// Mock the dependencies
vi.mock('../../src/modules/common/utils/indexedDbAdapter');
vi.mock('../../src/modules/common/utils/cryptoService');
vi.mock('../../src/modules/meds/utils/medUtils');

describe('dataService.unlockDatabase', () => {

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should return correct deductions when unlocking a database', async () => {
    // 1. Arrange
    const dbId = 1;
    const password = 'password';
    const lastUpdateDate = new Date('2023-10-26T10:00:00.000Z').toDateString();
    const newDate = new Date('2023-10-27T10:00:00.000Z').toDateString();

    const mockDbEntry = {
      id: dbId,
      encryptionStrategy: 'password',
      passwordData: { salt: 'mockSalt', iv: 'mockIv' },
      encryptedData: 'mockEncryptedData',
    };
    
    // This is the state of the data BEFORE the update function is called
    const originalMeds = [{ name: 'Aspirin', count: 10, dose: '1' }];
    const mockDecryptedData = {
      meds: originalMeds,
      lastDoseUpdate: lastUpdateDate,
    };

    const mockDeductions = { Aspirin: 2 };
    const mockUpdateResult = {
      updated: true,
      updatedItems: [{ name: 'Aspirin', count: 8, dose: '1' }],
      newDate: newDate,
      deductions: mockDeductions,
    };

    // Mock the functions that will be called
    dbAdapter.getFullDatabase.mockResolvedValue(mockDbEntry);
    crypto.deriveKeyFromPassword.mockResolvedValue('mockKey');
    // Use a function for mockResolvedValue to return a fresh object each time, preventing mutation issues
    crypto.decryptData.mockResolvedValue(JSON.parse(JSON.stringify(mockDecryptedData)));
    checkAndUpdateDailyDose.mockReturnValue(mockUpdateResult);

    // 2. Act
    const result = await dataService.unlockDatabase(dbId, password);

    // 3. Assert
    expect(dbAdapter.getFullDatabase).toHaveBeenCalledWith(dbId);
    expect(crypto.deriveKeyFromPassword).toHaveBeenCalledWith(password, mockDbEntry.passwordData.salt);
    expect(crypto.decryptData).toHaveBeenCalledWith(mockDbEntry.encryptedData, mockDbEntry.passwordData.iv, 'mockKey');
    
    // Assert that the check function was called with the ORIGINAL data
    expect(checkAndUpdateDailyDose).toHaveBeenCalledWith(originalMeds, lastUpdateDate);
    
    expect(result.success).toBe(true);
    expect(result.data.meds).toEqual(mockUpdateResult.updatedItems); // Ensure data is updated
    expect(result.deductions).toEqual(mockDeductions); // Crucial check for deductions
  });

  it('should return empty deductions if none are calculated', async () => {
    // 1. Arrange
    const dbId = 1;
    const password = 'password';
    const lastUpdateDate = new Date().toDateString();

    const mockDbEntry = {
      id: dbId,
      encryptionStrategy: 'password',
      passwordData: { salt: 'mockSalt', iv: 'mockIv' },
      encryptedData: 'mockEncryptedData',
    };
    const mockDecryptedData = {
      meds: [{ name: 'Aspirin', count: 10, dose: '1' }],
      lastDoseUpdate: lastUpdateDate,
    };
    const mockUpdateResult = {
      updated: false, // No update occurred
      updatedItems: mockDecryptedData.meds,
      newDate: lastUpdateDate,
      deductions: {}, // No deductions
    };

    dbAdapter.getFullDatabase.mockResolvedValue(mockDbEntry);
    crypto.deriveKeyFromPassword.mockResolvedValue('mockKey');
    crypto.decryptData.mockResolvedValue(mockDecryptedData);
    checkAndUpdateDailyDose.mockReturnValue(mockUpdateResult);

    // 2. Act
    const result = await dataService.unlockDatabase(dbId, password);

    // 3. Assert
    expect(result.success).toBe(true);
    expect(result.data.meds).toEqual(mockDecryptedData.meds);
    expect(result.deductions).toEqual({});
  });

  it('should return failure on decryption error', async () => {
    // 1. Arrange
    const dbId = 1;
    const password = 'wrong-password';
    const mockDbEntry = {
      id: dbId,
      encryptionStrategy: 'password',
      passwordData: { salt: 'mockSalt', iv: 'mockIv' },
      encryptedData: 'mockEncryptedData',
    };

    dbAdapter.getFullDatabase.mockResolvedValue(mockDbEntry);
    crypto.deriveKeyFromPassword.mockResolvedValue('mockKey');
    // Simulate a decryption failure
    crypto.decryptData.mockRejectedValue(new Error('Decryption failed'));

    // 2. Act
    const result = await dataService.unlockDatabase(dbId, password);

    // 3. Assert
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.deductions).toEqual({});
    expect(checkAndUpdateDailyDose).not.toHaveBeenCalled(); // Should not be called on failure
  });
});

describe('dataService.createDatabaseWithPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate salt, encrypt initial empty structure and create database', async () => {
    crypto.generateSalt.mockReturnValue('mockSalt');
    crypto.deriveKeyFromPassword.mockResolvedValue('mockKey');
    crypto.encryptData.mockResolvedValue({ iv: 'mockIv', encryptedData: 'mockEncrypted' });
    dbAdapter.createDatabase.mockResolvedValue(123);

    const result = await dataService.createDatabaseWithPassword('Neuer Tresor', 'secret123');

    expect(crypto.generateSalt).toHaveBeenCalled();
    expect(crypto.deriveKeyFromPassword).toHaveBeenCalledWith('secret123', 'mockSalt');
    expect(crypto.encryptData).toHaveBeenCalledWith(
      expect.objectContaining({
        meds: [],
        calendar: [],
        lastDoseUpdate: expect.any(String),
      }),
      'mockKey'
    );
    expect(dbAdapter.createDatabase).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Neuer Tresor',
        medsCount: 0,
        calendarCount: 0,
        encryptionStrategy: 'password',
        passwordData: { salt: 'mockSalt', iv: 'mockIv' },
        encryptedData: 'mockEncrypted',
      })
    );
    expect(result).toBe(123);
  });
});

describe('dataService.saveAndLockDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-encrypt data and update database entry with counts and modified date', async () => {
    const existingDb = {
      id: 1,
      name: 'Tresor',
      encryptionStrategy: 'password',
      passwordData: { salt: 'salt123', iv: 'oldIv' },
      encryptedData: 'oldEncrypted',
      medsCount: 0,
      calendarCount: 0,
    };

    dbAdapter.getFullDatabase.mockResolvedValue(existingDb);
    crypto.deriveKeyFromPassword.mockResolvedValue('derivedKey');
    crypto.encryptData.mockResolvedValue({ iv: 'newIv', encryptedData: 'newEncrypted' });
    dbAdapter.updateDatabase.mockResolvedValue(true);

    const payload = {
      meds: [{ name: 'Aspirin' }, { name: 'Ibuprofen' }],
      calendar: [{ title: 'Arzt' }],
      version: 2,
    };

    await dataService.saveAndLockDatabase(1, 'password', payload);

    expect(dbAdapter.getFullDatabase).toHaveBeenCalledWith(1);
    expect(crypto.deriveKeyFromPassword).toHaveBeenCalledWith('password', 'salt123');
    expect(crypto.encryptData).toHaveBeenCalledWith(payload, 'derivedKey');
    expect(dbAdapter.updateDatabase).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        passwordData: { salt: 'salt123', iv: 'newIv' },
        encryptedData: 'newEncrypted',
        medsCount: 2,
        calendarCount: 1,
        modifiedAt: expect.any(Date),
      })
    );
  });

  it('should throw an error when database to save is not found', async () => {
    dbAdapter.getFullDatabase.mockResolvedValue(null);

    await expect(
      dataService.saveAndLockDatabase(999, 'password', { meds: [] })
    ).rejects.toThrow('Database not found for saving.');
  });
});

describe('dataService.saveDisclaimerAccepted', () => {
  it('should delegate to dbAdapter.saveDisclaimerAccepted', async () => {
    dbAdapter.saveDisclaimerAccepted.mockResolvedValue(true);
    await dataService.saveDisclaimerAccepted(true);
    expect(dbAdapter.saveDisclaimerAccepted).toHaveBeenCalledWith(true);
  });

  it('should delegate to dbAdapter.saveDisclaimerVersion', async () => {
    dbAdapter.saveDisclaimerVersion.mockResolvedValue(true);
    await dataService.saveDisclaimerVersion(1);
    expect(dbAdapter.saveDisclaimerVersion).toHaveBeenCalledWith(1);
  });
});


