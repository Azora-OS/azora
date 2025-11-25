import { expect } from 'chai';
import { ethers } from 'hardhat';
import { StorageContract } from '../../contracts/storageContract';

describe('StorageContract', function () {
    let storageContract: StorageContract;

    beforeEach(async function () {
        const StorageContractFactory = await ethers.getContractFactory('StorageContract');
        storageContract = await StorageContractFactory.deploy();
        await storageContract.deployed();
    });

    it('should store a value', async function () {
        await storageContract.store(42);
        const value = await storageContract.retrieve();
        expect(value).to.equal(42);
    });

    it('should emit a ValueStored event when a value is stored', async function () {
        await expect(storageContract.store(42))
            .to.emit(storageContract, 'ValueStored')
            .withArgs(42);
    });

    it('should revert when retrieving a value before it is stored', async function () {
        await expect(storageContract.retrieve()).to.be.revertedWith('No value stored');
    });
});

