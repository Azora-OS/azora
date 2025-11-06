// Test script for Redemption contract
// Run with: npx hardhat test --network azora

const { expect } = require("chai");

describe("Redemption Contract", function () {
    let redemption, azrToken, owner, requester, treasury, admin;

    beforeEach(async function () {
        [owner, requester, treasury, admin] = await ethers.getSigners();

        // Deploy mock AZR token for testing
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        azrToken = await MockERC20.deploy("Azora Token", "AZR", ethers.utils.parseEther("1000000"));
        await azrToken.deployed();

        // Deploy Redemption contract
        const Redemption = await ethers.getContractFactory("Redemption");
        redemption = await Redemption.deploy(azrToken.address, admin.address);
        await redemption.deployed();

        // Mint tokens to requester
        await azrToken.mint(requester.address, ethers.utils.parseEther("1000"));
    });

    it("Should deploy with correct parameters", async function () {
        expect(await redemption.azrToken()).to.equal(azrToken.address);
        expect(await redemption.admin()).to.equal(admin.address);
    });

    it("Should allow redemption request", async function () {
        const amount = ethers.utils.parseEther("150");
        const bankDetails = "Test bank details";

        // Approve tokens
        await azrToken.connect(requester).approve(redemption.address, amount);

        // Request redemption
        await expect(redemption.connect(requester).requestRedeem(amount, bankDetails))
            .to.emit(redemption, "RedeemRequested")
            .withArgs(1, requester.address, amount, bankDetails);

        // Check redemption details
        const redemptionData = await redemption.getRedemption(1);
        expect(redemptionData.requester).to.equal(requester.address);
        expect(redemptionData.amount).to.equal(amount);
        expect(redemptionData.bankDetails).to.equal(bankDetails);
        expect(redemptionData.completed).to.equal(false);
    });

    it("Should allow admin to complete redemption", async function () {
        const amount = ethers.utils.parseEther("150");
        const bankDetails = "Test bank details";
        const bankRef = "BANK-12345";

        // Setup redemption request
        await azrToken.connect(requester).approve(redemption.address, amount);
        await redemption.connect(requester).requestRedeem(amount, bankDetails);

        // Complete redemption
        await expect(redemption.connect(admin).completeRedeem(1, treasury.address, bankRef))
            .to.emit(redemption, "RedeemCompleted")
            .withArgs(1, treasury.address, bankRef);

        // Check tokens transferred
        expect(await azrToken.balanceOf(treasury.address)).to.equal(amount);

        // Check redemption completed
        const redemptionData = await redemption.getRedemption(1);
        expect(redemptionData.completed).to.equal(true);
        expect(redemptionData.bankRef).to.equal(bankRef);
        expect(redemptionData.completedTreasury).to.equal(treasury.address);
    });

    it("Should reject non-admin completion", async function () {
        const amount = ethers.utils.parseEther("150");
        const bankDetails = "Test bank details";
        const bankRef = "BANK-12345";

        // Setup redemption request
        await azrToken.connect(requester).approve(redemption.address, amount);
        await redemption.connect(requester).requestRedeem(amount, bankDetails);

        // Try to complete with non-admin
        await expect(
            redemption.connect(requester).completeRedeem(1, treasury.address, bankRef)
        ).to.be.revertedWith("Only admin can call this function");
    });
});