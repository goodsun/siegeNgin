const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Base721A", function () {
  let base721A;
  let owner;
  let addr1;
  
  const NAME = "TestNFT";
  const SYMBOL = "TNFT";

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const Base721A = await ethers.getContractFactory("Base721A");
    base721A = await Base721A.deploy(NAME, SYMBOL);
    await base721A.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await base721A.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await base721A.name()).to.equal(NAME);
      expect(await base721A.symbol()).to.equal(SYMBOL);
    });

    it("Should start with token ID 1", async function () {
      await base721A.mint(1);
      expect(await base721A.ownerOf(1)).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      await base721A.mint(5);
      expect(await base721A.balanceOf(owner.address)).to.equal(5);
      expect(await base721A.totalSupply()).to.equal(5);
    });

    it("Should mint tokens to owner", async function () {
      await base721A.mint(3);
      expect(await base721A.ownerOf(1)).to.equal(owner.address);
      expect(await base721A.ownerOf(2)).to.equal(owner.address);
      expect(await base721A.ownerOf(3)).to.equal(owner.address);
    });

    it("Should revert if non-owner tries to mint", async function () {
      await expect(
        base721A.connect(addr1).mint(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Base URI", function () {
    it("Should allow owner to set base URI", async function () {
      const baseURI = "https://example.com/metadata/";
      await base721A.setBaseURI(baseURI);
      
      await base721A.mint(1);
      expect(await base721A.tokenURI(1)).to.equal(baseURI + "1");
    });

    it("Should revert if non-owner tries to set base URI", async function () {
      await expect(
        base721A.connect(addr1).setBaseURI("https://example.com/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Contract URI", function () {
    it("Should allow owner to set contract URI", async function () {
      const contractURI = "https://example.com/contract-metadata.json";
      await base721A.setContractURI(contractURI);
      expect(await base721A.contractURI()).to.equal(contractURI);
    });

    it("Should revert if non-owner tries to set contract URI", async function () {
      await expect(
        base721A.connect(addr1).setContractURI("https://example.com/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});