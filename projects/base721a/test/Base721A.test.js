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

  describe("Metadata Contract", function () {
    let mockMetadata;

    beforeEach(async function () {
      const MockMetadata = await ethers.getContractFactory("MockMetadata");
      mockMetadata = await MockMetadata.deploy("Test NFT", "A test NFT collection", "https://example.com/image.png");
      await mockMetadata.deployed();
    });

    it("Should use metadata contract when set", async function () {
      await base721A.mint(1);
      
      // Set metadata contract
      await base721A.setMetadataCA(mockMetadata.address);
      
      // tokenURI should now come from metadata contract
      const tokenURI = await base721A.tokenURI(1);
      expect(tokenURI).to.include("data:application/json;base64,");
      
      // Decode and check the JSON content
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const jsonData = JSON.parse(Buffer.from(base64Data, "base64").toString());
      expect(jsonData.name).to.equal("Test NFT #1");
      expect(jsonData.description).to.equal("A test NFT collection");
      expect(jsonData.image).to.equal("https://example.com/image.png");
    });

    it("Should return 404 JSON when metadata contract not set", async function () {
      await base721A.mint(1);
      
      // Without metadata contract, should return 404-like JSON
      const tokenURI = await base721A.tokenURI(1);
      expect(tokenURI).to.include("data:application/json;base64,");
      
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const jsonData = JSON.parse(Buffer.from(base64Data, "base64").toString());
      expect(jsonData.name).to.equal("404");
      expect(jsonData.description).to.equal("Metadata not found");
      expect(jsonData.image).to.equal("");
    });

    it("Should allow changing metadata contract", async function () {
      await base721A.mint(1);
      
      // Deploy second metadata contract
      const MockMetadata = await ethers.getContractFactory("MockMetadata");
      const mockMetadata2 = await MockMetadata.deploy("New NFT", "New description", "https://new.com/image.png");
      await mockMetadata2.deployed();
      
      // Set first metadata contract
      await base721A.setMetadataCA(mockMetadata.address);
      let tokenURI = await base721A.tokenURI(1);
      let base64Data = tokenURI.replace("data:application/json;base64,", "");
      let jsonData = JSON.parse(Buffer.from(base64Data, "base64").toString());
      expect(jsonData.name).to.equal("Test NFT #1");
      
      // Change to second metadata contract
      await base721A.setMetadataCA(mockMetadata2.address);
      tokenURI = await base721A.tokenURI(1);
      base64Data = tokenURI.replace("data:application/json;base64,", "");
      jsonData = JSON.parse(Buffer.from(base64Data, "base64").toString());
      expect(jsonData.name).to.equal("New NFT #1");
    });

    it("Should revert if non-owner tries to set metadata contract", async function () {
      await expect(
        base721A.connect(addr1).setMetadataCA(mockMetadata.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});