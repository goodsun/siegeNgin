const { deployBankContracts } = require("./1_deploy_banks");
const { deployAggregators } = require("./2_deploy_aggregators");
const { deployComposer } = require("./3_deploy_composer");
const { deployOnchainCats } = require("./4_deploy_onchain_cats");

async function main() {
  console.log("Starting full deployment...\n");
  
  try {
    // Phase 1: Deploy bank contracts (parallel)
    console.log("=== Phase 1: Bank Contracts ===");
    await deployBankContracts();
    console.log("");
    
    // Phase 2: Deploy aggregators (depends on banks)
    console.log("=== Phase 2: Aggregator Contracts ===");
    await deployAggregators();
    console.log("");
    
    // Phase 3: Deploy composer and metadata (depends on aggregators)
    console.log("=== Phase 3: Composer Contracts ===");
    await deployComposer();
    console.log("");
    
    // Phase 4: Deploy OnchainCats (depends on metadata)
    console.log("=== Phase 4: OnchainCats Contract ===");
    const addresses = await deployOnchainCats();
    console.log("");
    
    console.log("=== Deployment Complete! ===");
    console.log("All addresses saved to: deployments/addresses.json");
    
    return addresses;
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

// Execute
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });