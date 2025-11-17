const tamperProofService = require('../index');

describe('Tamper-Proof Data Service', () => {
  const userId = 'test-user-123';
  const dataType = 'test_data';
  const testData = { name: 'John Doe', age: 30, email: 'john@example.com' };

  beforeEach(() => {
    // Clear data store and audit trail before each test
    tamperProofService.dataStore.clear();
    tamperProofService.auditTrail = [];
  });

  test('should store data with hash and signature', () => {
    const result = tamperProofService.storeData(userId, dataType, testData);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.dataHash).toBeDefined();
    expect(result.signature).toBeDefined();
    expect(result.createdAt).toBeDefined();

    // Verify data was stored
    const storedEntry = tamperProofService.dataStore.get(result.id);
    expect(storedEntry).toBeDefined();
    expect(storedEntry.userId).toBe(userId);
    expect(storedEntry.dataType).toBe(dataType);
    expect(storedEntry.data).toEqual(testData);
  });

  test('should retrieve data and verify integrity', () => {
    // Store data first
    const storeResult = tamperProofService.storeData(userId, dataType, testData);

    // Retrieve data
    const retrievedData = tamperProofService.retrieveData(storeResult.id, userId);

    expect(retrievedData).toBeDefined();
    expect(retrievedData.id).toBe(storeResult.id);
    expect(retrievedData.data).toEqual(testData);
    expect(retrievedData.dataType).toBe(dataType);
    expect(retrievedData.isValid).toBe(true);
  });

  test('should update data with new signature', () => {
    // Store data first
    const storeResult = tamperProofService.storeData(userId, dataType, testData);

    // Update data
    const updatedData = { ...testData, age: 31 };
    const updateResult = tamperProofService.updateData(storeResult.id, userId, updatedData);

    expect(updateResult).toBeDefined();
    expect(updateResult.id).toBe(storeResult.id);
    expect(updateResult.dataHash).toBeDefined();
    expect(updateResult.signature).toBeDefined();

    // Verify updated data
    const retrievedData = tamperProofService.retrieveData(storeResult.id, userId);
    expect(retrievedData.data).toEqual(updatedData);
    expect(retrievedData.isValid).toBe(true);
  });

  test('should delete data', () => {
    // Store data first
    const storeResult = tamperProofService.storeData(userId, dataType, testData);

    // Verify data exists
    expect(tamperProofService.dataStore.has(storeResult.id)).toBe(true);

    // Delete data
    const deleteResult = tamperProofService.deleteData(storeResult.id, userId);

    expect(deleteResult.success).toBe(true);

    // Verify data was deleted
    expect(tamperProofService.dataStore.has(storeResult.id)).toBe(false);
  });

  test('should verify data integrity', () => {
    // Store data
    const storeResult = tamperProofService.storeData(userId, dataType, testData);
    const storedEntry = tamperProofService.dataStore.get(storeResult.id);

    // Verify integrity
    const isValid = tamperProofService.verifyDataIntegrity(storedEntry);

    expect(isValid).toBe(true);
  });

  test('should detect tampered data', () => {
    // Store data
    const storeResult = tamperProofService.storeData(userId, dataType, testData);
    const storedEntry = tamperProofService.dataStore.get(storeResult.id);

    // Tamper with data
    storedEntry.data.name = 'Evil Hacker';

    // Verify integrity fails
    const isValid = tamperProofService.verifyDataIntegrity(storedEntry);

    expect(isValid).toBe(false);
  });

  test('should list user data', () => {
    // Store multiple data entries
    tamperProofService.storeData(userId, 'type1', { data: 'test1' });
    tamperProofService.storeData(userId, 'type2', { data: 'test2' });
    tamperProofService.storeData('other-user', 'type3', { data: 'test3' });

    // List user data
    const userEntries = tamperProofService.listUserData(userId);

    expect(userEntries.length).toBe(2);
    expect(userEntries.every(entry => entry.dataType.startsWith('type'))).toBe(true);
  });

  test('should verify all user data', () => {
    // Store multiple data entries
    tamperProofService.storeData(userId, 'type1', { data: 'test1' });
    tamperProofService.storeData(userId, 'type2', { data: 'test2' });

    // Verify all user data
    const results = tamperProofService.verifyAllUserData(userId);

    expect(results.length).toBe(2);
    expect(results.every(result => result.isValid)).toBe(true);
  });

  test('should maintain audit trail', () => {
    // Store data
    const storeResult = tamperProofService.storeData(userId, dataType, testData);

    // Update data
    tamperProofService.updateData(storeResult.id, userId, { ...testData, age: 31 });

    // Get audit trail
    const auditTrail = tamperProofService.getAuditTrail(storeResult.id);

    expect(auditTrail.length).toBe(2);
    expect(auditTrail[0].action).toBe('CREATE');
    expect(auditTrail[1].action).toBe('UPDATE');
  });
});
