const hre = require("hardhat");

async function main() {
  console.log("Deploying Base721A...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Base721A = await hre.ethers.getContractFactory("Base721A");
  const base721A = await Base721A.deploy("MyNFT", "MNFT");
  await base721A.deployed();

  console.log("Base721A deployed to:", base721A.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});