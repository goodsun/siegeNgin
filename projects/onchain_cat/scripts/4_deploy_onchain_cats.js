const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function deployOnchainCats() {
  console.log("Starting OnchainCats deployment...");
  
  // Load addresses
  const addressesPath = path.join(__dirname, "../deployments/addresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  
  if (!addresses.CatMetadata) {
    throw new Error("CatMetadata address not found. Please deploy CatMetadata first.");
  }
  
  // Deploy OnchainCats
  const OnchainCats = await hre.ethers.getContractFactory("OnchainCats");
  const onchainCats = await OnchainCats.deploy(addresses.CatMetadata);
  await onchainCats.waitForDeployment();
  const onchainCatsAddress = await onchainCats.getAddress();
  
  console.log("OnchainCats deployed to:", onchainCatsAddress);
  
  // Update addresses
  addresses.OnchainCats = onchainCatsAddress;
  
  // Save updated addresses
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  console.log("OnchainCats deployed successfully!");
  
  // Notify OpenSea about the collection
  console.log("\nEmitting BatchMetadataUpdate event to notify OpenSea...");
  const onchainCatsContract = await hre.ethers.getContractAt("OnchainCats", onchainCatsAddress);
  const tx = await onchainCatsContract.notifyCollectionExists();
  await tx.wait();
  console.log("BatchMetadataUpdate event emitted successfully!");
  console.log("Transaction hash:", tx.hash);
  
  return addresses;
}

async function main() {
  try {
    await deployOnchainCats();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

module.exports = { deployOnchainCats };