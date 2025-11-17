const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AZR Token - Ubuntu Tests", function () {
  let azrToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const AZRToken = await ethers.getContractFactory("AZRToken");
    azrToken = await AZRToken.deploy();
    await azrToken.deployed();
  });

  describe("Ubuntu Deployment", function () {
    it("Should deploy with correct Ubuntu values", async function () {
      expect(await azrToken.name()).to.equal("Azora Token");
      expect(await azrToken.symbol()).to.equal("AZR");
      expect(await azrToken.totalSupply()).to.equal(ethers.utils.parseEther("100000000"));
    });

    it("Should set deployer as Ubuntu validator", async function () {
      expect(await azrToken.ubuntuValidators(owner.address)).to.be.true;
    });
  });

  describe("Ubuntu Mining", function () {
    it("Should mine AZR for knowledge proof", async function () {
      await azrToken.ubuntuMine(addr1.address, "Python Tutorial Completed", 85);
      
      const balance = await azrToken.balanceOf(addr1.address);
      expect(balance).to.equal(ethers.utils.parseEther("15")); // 10 * 1.5 for high score
    });

    it("Should track knowledge scores", async function () {
      await azrToken.ubuntuMine(addr1.address, "AI Course Completed", 95);
      
      const score = await azrToken.knowledgeScore(addr1.address);
      expect(score).to.equal(95);
    });

    it("Should only allow validators to mine", async function () {
      await expect(
        azrToken.connect(addr1).ubuntuMine(addr2.address, "Test", 80)
      ).to.be.revertedWith("Not an Ubuntu validator");
    });
  });

  describe("Ubuntu Contributions", function () {
    it("Should reward Ubuntu contributions", async function () {
      const rewardAmount = ethers.utils.parseEther("50");
      
      await azrToken.rewardUbuntuContribution(
        addr1.address,
        rewardAmount,
        "Community mentoring"
      );
      
      const balance = await azrToken.balanceOf(addr1.address);
      expect(balance).to.equal(rewardAmount);
    });
  });

  describe("Ubuntu Governance", function () {
    it("Should add new Ubuntu validators", async function () {
      await azrToken.addUbuntuValidator(addr1.address);
      expect(await azrToken.ubuntuValidators(addr1.address)).to.be.true;
    });
  });
});