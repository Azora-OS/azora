import { StorageService } from '../../services/storageService';
import { expect } from 'chai';

describe('StorageService', () => {
    let storageService: StorageService;

    beforeEach(() => {
        storageService = new StorageService();
    });

    describe('saveData', () => {
        it('should save data successfully', async () => {
            const data = { key: 'testKey', value: 'testValue' };
            const result = await storageService.saveData(data.key, data.value);
            expect(result).to.be.true;
        });

        it('should throw an error when key is missing', async () => {
            const data = { value: 'testValue' };
            await expect(storageService.saveData(data.key, data.value)).to.be.rejectedWith('Key is required');
        });
    });

    describe('getData', () => {
        it('should retrieve data successfully', async () => {
            const data = { key: 'testKey', value: 'testValue' };
            await storageService.saveData(data.key, data.value);
            const result = await storageService.getData(data.key);
            expect(result).to.equal(data.value);
        });

        it('should return null for non-existent key', async () => {
            const result = await storageService.getData('nonExistentKey');
            expect(result).to.be.null;
        });
    });

    describe('deleteData', () => {
        it('should delete data successfully', async () => {
            const data = { key: 'testKey', value: 'testValue' };
            await storageService.saveData(data.key, data.value);
            const result = await storageService.deleteData(data.key);
            expect(result).to.be.true;
        });

        it('should return false when trying to delete non-existent key', async () => {
            const result = await storageService.deleteData('nonExistentKey');
            expect(result).to.be.false;
        });
    });
});

