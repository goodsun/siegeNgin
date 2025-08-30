// Main application logic
let provider;
let signer;
let selectedProject = "";
let selectedContract = "";
let contracts = {};
let deployedContract = null; // Store deployed contract instance
let sharedContracts = []; // Store shared contracts configuration

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  // Load projects
  await loadProjects();

  // Event listeners
  document
    .getElementById("connectWallet")
    .addEventListener("click", connectWallet);
  document
    .getElementById("projectSelect")
    .addEventListener("change", onProjectChange);
  document
    .getElementById("refreshProjects")
    .addEventListener("click", loadProjects);
  document
    .getElementById("compileBtn")
    .addEventListener("click", compileProject);
  document
    .getElementById("refreshContracts")
    .addEventListener("click", loadContracts);
  document
    .getElementById("deployBtn")
    .addEventListener("click", deployContract);
  document
    .getElementById("cleanProject")
    .addEventListener("click", cleanProject);
  document
    .getElementById("createProject")
    .addEventListener("click", createNewProject);

  // Tab switching functionality
  const deployCompileTab = document.getElementById("deployCompileTab");
  const interfaceInteractionTab = document.getElementById(
    "interfaceInteractionTab"
  );
  const compileDeploySection = document.getElementById("compileDeploySection");
  const interfaceInteractionContent = document.getElementById(
    "interfaceInteractionContent"
  );
  const oldInterfaceSection = document.getElementById(
    "interfaceInteractionSection"
  );
  const mainTabContainer = document.getElementById("mainTabContainer");

  // Move Interface Interaction content to tab container
  if (oldInterfaceSection && interfaceInteractionContent) {
    // Clone the content without the outer wrapper
    interfaceInteractionContent.innerHTML = oldInterfaceSection.innerHTML;
    // Remove the old section
    oldInterfaceSection.remove();

    // Re-initialize event listeners for interface interaction after moving content
    initializeInterfaceInteractionListeners();
  }

  // Hide tab container initially if no project selected
  if (!selectedProject) {
    mainTabContainer.classList.add("hidden");
  }

  // Deploy & Compile Tab
  deployCompileTab.addEventListener("click", () => {
    // Update tab styles
    deployCompileTab.classList.add(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "bg-gray-50"
    );
    deployCompileTab.classList.remove("text-gray-600");
    interfaceInteractionTab.classList.remove(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "bg-gray-50"
    );
    interfaceInteractionTab.classList.add("text-gray-600");

    // Show/hide content
    compileDeploySection.classList.remove("hidden");
    interfaceInteractionContent.classList.add("hidden");

    // Show deployment section if it exists
    const deploymentSection = document.getElementById("deploymentSection");
    if (deploymentSection) {
      deploymentSection.classList.remove("hidden");
    }
  });

  // Interface Interaction Tab
  interfaceInteractionTab.addEventListener("click", () => {
    // Update tab styles
    interfaceInteractionTab.classList.add(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "bg-gray-50"
    );
    interfaceInteractionTab.classList.remove("text-gray-600");
    deployCompileTab.classList.remove(
      "text-blue-600",
      "border-b-2",
      "border-blue-600",
      "bg-gray-50"
    );
    deployCompileTab.classList.add("text-gray-600");

    // Show/hide content
    interfaceInteractionContent.classList.remove("hidden");
    compileDeploySection.classList.add("hidden");

    // Hide deployment section
    const deploymentSection = document.getElementById("deploymentSection");
    if (deploymentSection) {
      deploymentSection.classList.add("hidden");
    }

    // Update interface data
    updateCurrentNetworkInfo();
    showDeployedContractsQuickAccess();

    // Check and load interfaces if available
    if (selectedProject) {
      checkInterfaceDirectory();
    }
  });

  // Shared contracts event listeners
  document
    .getElementById("manageSharedBtn")
    .addEventListener("click", toggleSharedContractsDialog);
  document
    .getElementById("addSharedContract")
    .addEventListener("click", addSharedContract);

  // Contract interaction event listeners
  document
    .getElementById("readTab")
    .addEventListener("click", () => switchTab("read"));
  document
    .getElementById("writeTab")
    .addEventListener("click", () => switchTab("write"));
  document
    .getElementById("eventsTab")
    .addEventListener("click", () => switchTab("events"));
  document
    .getElementById("refreshEvents")
    .addEventListener("click", refreshEvents);
});

// Load available projects
async function loadProjects() {
  try {
    const response = await fetch("/api/projects");
    const data = await response.json();

    const select = document.getElementById("projectSelect");
    select.innerHTML = '<option value="">Select a project...</option>';

    data.projects.forEach((project) => {
      const option = document.createElement("option");
      option.value = project;
      option.textContent = project;
      select.appendChild(option);
    });
  } catch (error) {
    showMessage("Failed to load projects", "error");
  }
}

// Validate project name on client side
function isValidProjectName(name) {
  // Same validation as server
  if (!name) return false;

  const dangerous = ["..", "/", "\\", "~", "./", "../", "..\\", ".\\"];
  for (const pattern of dangerous) {
    if (name.includes(pattern)) {
      return false;
    }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return false;
  }

  if (name.length > 100) {
    return false;
  }

  return true;
}

// Handle project selection change
async function onProjectChange(event) {
  selectedProject = event.target.value;

  // Validate project name
  if (selectedProject && !isValidProjectName(selectedProject)) {
    showMessage("Invalid project name", "error");
    selectedProject = "";
    event.target.value = "";
    return;
  }

  if (selectedProject) {
    await loadContracts();
    await loadProjectStatus();
    document.getElementById("cleanProject").classList.remove("hidden");

    // Show main tab container
    document.getElementById("mainTabContainer").classList.remove("hidden");

    // Load deployed addresses for this project
    await checkDeployedAddresses();

    // Update Interface Interaction section if visible
    const interfaceSection = document.getElementById(
      "interfaceInteractionSection"
    );
    if (interfaceSection && !interfaceSection.classList.contains("hidden")) {
      showDeployedContractsQuickAccess();
    }
  } else {
    document.getElementById("contractsContainer").innerHTML =
      '<p class="text-gray-500">Select a project first</p>';
    document.getElementById("cleanProject").classList.add("hidden");
    document.getElementById("projectStatus").classList.add("hidden");

    // Hide main tab container
    document.getElementById("mainTabContainer").classList.add("hidden");

    // Clear deployed addresses
    deployedAddresses = {};
    window.deployedContracts = {};
  }
}

// Load project status
async function loadProjectStatus() {
  if (!selectedProject) return;

  try {
    const response = await fetch(`/api/projects/${selectedProject}/status`);
    const status = await response.json();

    console.log("Project status:", status); // デバッグ用

    const statusDetails = document.getElementById("statusDetails");
    statusDetails.innerHTML = "";

    const items = [
      {
        label: "Dependencies",
        value: status.hasDependencies ? "✅ Installed" : "❌ Not installed",
      },
      {
        label: "Build artifacts",
        value: status.hasArtifacts ? "✅ Present" : "❌ Not built",
      },
      { label: "Cache", value: status.hasCache ? "✅ Present" : "❌ Empty" },
      {
        label: "Interface files",
        value: status.hasInterfaces ? "✅ Generated" : "❌ Not generated",
      },
    ];

    items.forEach((item) => {
      const p = document.createElement("p");
      p.innerHTML = `<span class="text-gray-600">${item.label}:</span> ${item.value}`;
      statusDetails.appendChild(p);
    });

    document.getElementById("projectStatus").classList.remove("hidden");
  } catch (error) {
    console.error("Failed to load project status:", error);
  }
}

// Clean project
async function cleanProject() {
  if (!selectedProject) return;

  const confirm = window.confirm(
    `This will delete:\n` +
      `- node_modules\n` +
      `- artifacts\n` +
      `- cache\n` +
      `- interface (generated ABI/interface files)\n` +
      `- other .gitignore entries\n\n` +
      `Are you sure you want to clean the project "${selectedProject}"?`
  );

  if (!confirm) return;

  showMessage("Cleaning project...", "info");

  try {
    const response = await fetch(`/api/projects/${selectedProject}/clean`, {
      method: "POST",
    });

    const data = await response.json();

    if (data.success) {
      showMessage(`Cleaned ${data.deletedFiles.length} items`, "success");

      // Show details
      if (data.deletedFiles.length > 0) {
        console.log("Deleted:", data.deletedFiles);
      }
      if (data.errors.length > 0) {
        console.error("Errors:", data.errors);
      }

      // Reload status
      await loadProjectStatus();
      await loadContracts();
    } else {
      showMessage(`Clean failed: ${data.error}`, "error");
    }
  } catch (error) {
    showMessage("Clean failed", "error");
  }
}

// Load contracts for selected project
async function loadContracts() {
  if (!selectedProject) return;

  try {
    const response = await fetch(`/api/projects/${selectedProject}/contracts`);
    const data = await response.json();

    contracts = data.contracts;
    const container = document.getElementById("contractsContainer");
    container.innerHTML = "";

    if (Object.keys(contracts).length === 0) {
      container.innerHTML =
        '<p class="text-gray-500">No contracts found. Compile first.</p>';
      return;
    }

    Object.keys(contracts).forEach((contractName) => {
      const div = document.createElement("div");
      div.className = "flex items-center mb-2";
      div.innerHTML = `
                <input type="radio" name="contract" value="${contractName}"
                       id="contract-${contractName}" class="mr-2">
                <label for="contract-${contractName}" class="cursor-pointer">${contractName}</label>
            `;
      container.appendChild(div);
    });

    // Add change listener to radio buttons
    document.querySelectorAll('input[name="contract"]').forEach((radio) => {
      radio.addEventListener("change", onContractSelect);
    });
  } catch (error) {
    showMessage("Failed to load contracts", "error");
  }
}

// Handle contract selection
function onContractSelect(event) {
  selectedContract = event.target.value;
  updateDeployButton();

  // Show constructor parameters if any
  const contract = contracts[selectedContract];
  if (contract && contract.abi) {
    const constructor = contract.abi.find(
      (item) => item.type === "constructor"
    );
    if (constructor && constructor.inputs.length > 0) {
      showConstructorParams(constructor.inputs);
    } else {
      document.getElementById("constructorParams").classList.add("hidden");
    }
  }
}

// Show constructor parameter inputs
function showConstructorParams(inputs) {
  const container = document.getElementById("paramsContainer");
  container.innerHTML = "";

  inputs.forEach((input, index) => {
    const div = document.createElement("div");
    div.className = "mb-3";

    // Determine input type based on Solidity type
    let inputType = "text";
    let placeholder = `Enter ${input.type}`;
    let pattern = "";
    let additionalInfo = "";

    if (input.type.includes("uint") || input.type.includes("int")) {
      inputType = "number";
      placeholder = "Enter number";
      pattern = "^-?[0-9]+$";
    } else if (input.type === "address") {
      placeholder = "0x...";
      pattern = "^0x[a-fA-F0-9]{40}$";
      additionalInfo =
        '<span class="text-xs text-gray-500">Must be a valid Ethereum address</span>';
    } else if (input.type === "bool") {
      // Use select for boolean
      div.innerHTML = `
                <label class="block text-sm font-medium mb-1">${input.name} (${input.type})</label>
                <select id="param-${index}" class="w-full border rounded px-3 py-2" data-type="${input.type}">
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
            `;
      container.appendChild(div);
      return;
    } else if (input.type.includes("[]")) {
      placeholder = "Enter comma-separated values";
      additionalInfo =
        '<span class="text-xs text-gray-500">Separate array elements with commas</span>';
    }

    div.innerHTML = `
            <label class="block text-sm font-medium mb-1">${input.name} (${input.type})</label>
            <input type="${inputType}"
                   id="param-${index}"
                   class="w-full border rounded px-3 py-2"
                   placeholder="${placeholder}"
                   pattern="${pattern}"
                   data-type="${input.type}"
                   onblur="validateInput(${index}, '${input.type}')">
            ${additionalInfo}
            <span id="error-${index}" class="text-xs text-red-500 hidden"></span>
        `;
    container.appendChild(div);
  });

  document.getElementById("constructorParams").classList.remove("hidden");
}

// Network configurations
const NETWORKS = {
  1: {
    name: "Ethereum Mainnet",
    color: "text-red-600",
    warning: true,
    symbol: "ETH",
  },
  5: {
    name: "Goerli Testnet",
    color: "text-blue-600",
    warning: false,
    symbol: "ETH",
  },
  11155111: {
    name: "Sepolia Testnet",
    color: "text-blue-600",
    warning: false,
    symbol: "ETH",
  },
  137: {
    name: "Polygon Mainnet",
    color: "text-purple-600",
    warning: true,
    symbol: "POL",
  },
  80001: {
    name: "Mumbai Testnet",
    color: "text-purple-600",
    warning: false,
    symbol: "POL",
  },
  1337: {
    name: "Localhost",
    color: "text-green-600",
    warning: false,
    symbol: "ETH",
  },
  31337: {
    name: "Hardhat",
    color: "text-green-600",
    warning: false,
    symbol: "ETH",
  },
};

// Connect MetaMask wallet
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    showMessage("Please install MetaMask!", "error");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    // Validate network
    const networkInfo = NETWORKS[network.chainId] || {
      name: `Unknown Network (Chain ID: ${network.chainId})`,
      color: "text-gray-600",
      warning: true,
      symbol: "ETH",
    };

    // Update UI with network validation
    document.getElementById("accountAddress").textContent = address;
    document.getElementById("accountBalance").textContent =
      ethers.utils.formatEther(balance);
    document.getElementById("tokenSymbol").textContent = networkInfo.symbol;

    const networkElement = document.getElementById("networkName");
    networkElement.textContent = networkInfo.name;
    networkElement.className = `font-semibold ${networkInfo.color}`;

    // Clear previous warnings
    const existingWarning = document.querySelector("#accountInfo .bg-red-50");
    if (existingWarning) {
      existingWarning.remove();
    }

    // Show warning for mainnet
    if (networkInfo.warning) {
      const warningDiv = document.createElement("div");
      warningDiv.className =
        "mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 text-left";
      warningDiv.innerHTML = ` <b>⚠️ Warning</b> <br />You are connected to ${networkInfo.name}. <br />Real ${networkInfo.symbol} will be used!`;
      document.getElementById("accountInfo").appendChild(warningDiv);
    }

    document.getElementById("connectWallet").classList.add("hidden");
    document.getElementById("accountInfo").classList.remove("hidden");

    updateDeployButton();

    // Listen for account changes
    window.ethereum.on("accountsChanged", connectWallet);
    window.ethereum.on("chainChanged", () => window.location.reload());
  } catch (error) {
    showMessage("Failed to connect wallet", "error");
  }
}

// Compile project
async function compileProject() {
  if (!selectedProject) {
    showMessage("Please select a project first", "error");
    return;
  }

  showMessage("Checking dependencies...", "info");

  try {
    const response = await fetch(`/api/projects/${selectedProject}/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sharedContracts: sharedContracts,
      }),
    });

    // Handle streaming response for installation progress
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            if (message.status === "installing") {
              showMessage(
                "Installing dependencies... This may take a minute.",
                "info"
              );
            } else if (message.status === "installed") {
              showMessage("Dependencies installed!", "success");
              await loadProjectStatus();
            }
          } catch {
            // Not JSON, might be final response
          }
        }
      }
    }

    // Parse final response
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer);
        if (data.success) {
          showMessage("Compilation successful!", "success");
          // 少し待ってからステータスを更新（ファイルシステムの遅延対策）
          setTimeout(async () => {
            await loadContracts();
            await loadProjectStatus();
          }, 500);
        } else {
          showMessage(`Compilation failed: ${data.error}`, "error");
        }
      } catch (parseError) {
        console.error("Failed to parse response:", buffer);
        // それでもコンパイルは成功している可能性があるので、ステータスを更新
        setTimeout(async () => {
          await loadContracts();
          await loadProjectStatus();
        }, 500);
      }
    }
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      showMessage(
        "サーバーに接続できません。サーバーが起動しているか確認してください。",
        "error"
      );
    } else if (
      error.name === "TypeError" &&
      error.message === "network error"
    ) {
      showMessage(
        "ネットワークエラーが発生しました。接続を確認してください。",
        "error"
      );
    } else {
      showMessage("Compilation failed: " + error.message, "error");
    }
    console.error(error);
  }
}

// Create new project
async function createNewProject() {
  const projectName = prompt("Enter new project name:");

  if (!projectName) return;

  // Validate project name (alphanumeric, hyphens, underscores)
  if (!projectName.match(/^[a-zA-Z0-9_-]+$/)) {
    showMessage(
      "Invalid project name. Use only letters, numbers, hyphens, and underscores.",
      "error"
    );
    return;
  }

  try {
    showMessage("Creating new project...", "info");

    const response = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.trim().split("\n");

      for (const line of lines) {
        if (line) {
          try {
            const data = JSON.parse(line);
            if (data.status) {
              showMessage(data.message, "info");
            } else if (data.success) {
              showMessage(data.message, "success");
              // Reload projects and select the new one
              await loadProjects();
              document.getElementById("projectSelect").value = projectName;
              await onProjectChange({ target: { value: projectName } });
            } else if (data.error) {
              showMessage(data.error, "error");
            }
          } catch (e) {
            console.error("Failed to parse:", line);
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    showMessage("Failed to create project: " + error.message, "error");
  }
}

// Deploy contract
async function deployContract() {
  if (!selectedContract || !signer) return;

  try {
    // Check if ethers is loaded
    console.log(
      "ethers object:",
      typeof ethers !== "undefined" ? "loaded" : "not loaded"
    );
    if (typeof ethers !== "undefined") {
      console.log("ethers.ContractFactory:", ethers.ContractFactory);
    }

    showMessage("Preparing deployment...", "info");

    const contract = contracts[selectedContract];

    // Validate constructor params before proceeding
    let constructorParams;
    try {
      constructorParams = getConstructorParams();

      // Additional validation against ABI
      const constructor = contract.abi.find(
        (item) => item.type === "constructor"
      );
      if (
        constructor &&
        constructor.inputs.length !== constructorParams.length
      ) {
        throw new Error(
          `Expected ${constructor.inputs.length} parameters, got ${constructorParams.length}`
        );
      }
    } catch (error) {
      showMessage(`Parameter validation failed: ${error.message}`, "error");
      return;
    }

    const response = await fetch(`/api/projects/${selectedProject}/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractName: selectedContract,
        constructorArgs: constructorParams,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      showMessage(`Deploy preparation failed: ${data.error}`, "error");
      return;
    }

    // Validate bytecode
    if (!data.bytecode || data.bytecode === "0x") {
      showMessage(
        "Contract bytecode not found. Please compile the project first.",
        "error"
      );
      return;
    }

    // Create contract factory
    console.log("Creating contract factory...");
    console.log("ABI:", contract.abi);
    console.log("Bytecode length:", data.bytecode?.length);
    console.log("Signer:", signer);

    const factory = new ethers.ContractFactory(
      contract.abi,
      data.bytecode,
      signer
    );

    console.log("Factory created:", factory);
    console.log("Factory.deploy method:", factory.deploy);
    console.log("Constructor params:", constructorParams);

    // Estimate gas
    showMessage("Estimating gas...", "info");
    let gasEstimate;
    try {
      console.log("Attempting gas estimation...");
      console.log("factory.estimateGas:", factory.estimateGas);

      // ethers v5 uses getDeployTransaction for gas estimation
      const deployTransaction = factory.getDeployTransaction(
        ...constructorParams
      );
      gasEstimate = await provider.estimateGas(deployTransaction);

      const gasPrice = await provider.getGasPrice();
      const estimatedCost = gasEstimate.mul(gasPrice);

      // Show gas estimation dialog
      const confirmDeploy = await showGasEstimateDialog({
        gasLimit: gasEstimate.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, "gwei"),
        estimatedCost: ethers.utils.formatEther(estimatedCost),
        network: await provider.getNetwork(),
      });

      if (!confirmDeploy) {
        showMessage("Deployment cancelled", "info");
        return;
      }
    } catch (error) {
      showMessage(`Gas estimation failed: ${error.message}`, "error");
      return;
    }

    // Deploy with gas limit
    showMessage("Deploying contract...", "info");

    // Get current network
    const network = await provider.getNetwork();
    let deployOptions = {
      gasLimit: gasEstimate.mul(150).div(100), // 50% buffer
    };

    // For Amoy, double the gas price
    if (network.chainId === 80002) {
      const gasPrice = await provider.getGasPrice();
      deployOptions.gasPrice = gasPrice.mul(2);
    }

    const deployTx = await factory.deploy(...constructorParams, deployOptions);
    showMessage("Transaction sent. Waiting for confirmation...", "info");

    const deployed = await deployTx.deployed();

    // Show results
    showDeployResults({
      contractName: selectedContract,
      address: deployed.address,
      transactionHash: deployTx.deployTransaction.hash,
      abi: contract.abi,
      gasUsed: deployTx.deployTransaction.gasLimit.toString(),
    });

    showMessage("Contract deployed successfully!", "success");

    // Store deployed contract instance for interaction
    deployedContract = new ethers.Contract(
      deployed.address,
      contract.abi,
      signer
    );

    // Show interaction section
    setTimeout(() => {
      showContractInteraction(selectedContract, deployed.address, contract.abi);
    }, 2000);
  } catch (error) {
    console.error(error);
    showMessage(`Deploy failed: ${error.message}`, "error");
  }
}

// Validate input based on type
function validateInput(index, type) {
  const input = document.getElementById(`param-${index}`);
  const errorSpan = document.getElementById(`error-${index}`);
  const value = input.value.trim();

  let isValid = true;
  let errorMessage = "";

  if (type === "address") {
    if (!value.match(/^0x[a-fA-F0-9]{40}$/)) {
      isValid = false;
      errorMessage = "Invalid Ethereum address";
    }
  } else if (type.includes("uint")) {
    if (!value.match(/^\d+$/) || parseInt(value) < 0) {
      isValid = false;
      errorMessage = "Must be a positive number";
    }
  } else if (type.includes("int")) {
    if (!value.match(/^-?\d+$/)) {
      isValid = false;
      errorMessage = "Must be a valid integer";
    }
  } else if (type.includes("bytes32")) {
    if (!value.match(/^0x[a-fA-F0-9]{64}$/)) {
      isValid = false;
      errorMessage = "Must be 32 bytes hex string";
    }
  }

  if (!isValid) {
    input.classList.add("border-red-500");
    errorSpan.textContent = errorMessage;
    errorSpan.classList.remove("hidden");
  } else {
    input.classList.remove("border-red-500");
    errorSpan.classList.add("hidden");
  }

  return isValid;
}

// Get constructor parameters from inputs with validation
function getConstructorParams() {
  const params = [];
  const inputs = document.querySelectorAll('[id^="param-"]');

  inputs.forEach((input) => {
    const value = input.value.trim();
    const type = input.getAttribute("data-type");

    try {
      // Type-specific parsing
      if (type === "bool") {
        params.push(value === "true");
      } else if (type.includes("uint") || type.includes("int")) {
        // Handle big numbers
        if (type.includes("256")) {
          params.push(ethers.BigNumber.from(value));
        } else {
          params.push(parseInt(value));
        }
      } else if (type === "address") {
        // Validate and checksum address
        params.push(ethers.utils.getAddress(value));
      } else if (type.includes("[]")) {
        // Handle arrays
        const arrayValues = value.split(",").map((v) => v.trim());
        if (type.includes("address[]")) {
          params.push(arrayValues.map((addr) => ethers.utils.getAddress(addr)));
        } else if (type.includes("uint") || type.includes("int")) {
          params.push(
            arrayValues.map((v) =>
              type.includes("256") ? ethers.BigNumber.from(v) : parseInt(v)
            )
          );
        } else {
          params.push(arrayValues);
        }
      } else if (type.includes("bytes")) {
        // Ensure proper hex formatting
        params.push(value.startsWith("0x") ? value : "0x" + value);
      } else {
        // Default: string types
        params.push(value);
      }
    } catch (error) {
      throw new Error(`Invalid value for ${type}: ${error.message}`);
    }
  });

  return params;
}

// Show deployment results
function showDeployResults(result) {
  const resultsSection = document.getElementById("resultsSection");
  const resultsContainer = document.getElementById("deployResults");

  resultsContainer.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded p-4">
            <p class="font-semibold text-green-800">✅ Deployment Successful!</p>
            <p class="mt-2"><strong>Contract:</strong> ${result.contractName}</p>
            <p><strong>Address:</strong>
                <span class="font-mono text-sm">${result.address}</span>
                <button onclick="copyToClipboard('${result.address}')" class="ml-2 text-blue-500 hover:text-blue-700">
                    [Copy]
                </button>
            </p>
            <p><strong>Transaction Hash:</strong>
                <span class="font-mono text-sm">${result.transactionHash}</span>
            </p>
            <div class="mt-3">
                <p><strong>ABI:</strong></p>
                <div class="mt-1 space-x-2">
                    <button onclick="showABI('${result.contractName}')" class="text-blue-500 hover:text-blue-700">
                        [Show]
                    </button>
                    <button onclick="downloadABI('${result.contractName}')" class="text-blue-500 hover:text-blue-700">
                        [Download]
                    </button>
                    <button onclick="copyABI('${result.contractName}')" class="text-blue-500 hover:text-blue-700">
                        [Copy]
                    </button>
                </div>
            </div>
        </div>
    `;

  resultsSection.classList.remove("hidden");
}

// Update deploy button state
function updateDeployButton() {
  const button = document.getElementById("deployBtn");
  button.disabled = !selectedContract || !signer;
}

// Show message
function showMessage(message, type = "info") {
  const container = document.getElementById("messageContainer");
  const div = document.createElement("div");

  const colors = {
    info: "bg-blue-500",
    success: "bg-green-500",
    error: "bg-red-500",
  };

  div.className = `${colors[type]} text-white px-4 py-3 rounded shadow-lg mb-2`;
  div.textContent = message;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 5000);
}

// Utility functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  showMessage("Copied to clipboard!", "success");
}

function copyABI(contractName) {
  const abi = JSON.stringify(contracts[contractName].abi, null, 2);
  copyToClipboard(abi);
}

function downloadABI(contractName) {
  const abi = JSON.stringify(contracts[contractName].abi, null, 2);
  const blob = new Blob([abi], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${contractName}_ABI.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function showABI(contractName) {
  const abi = JSON.stringify(contracts[contractName].abi, null, 2);
  alert(`ABI for ${contractName}:\n\n${abi}`);
}

// Show gas estimate dialog
function showGasEstimateDialog(gasInfo) {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    dialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md">
                <h3 class="text-lg font-semibold mb-4">⛽ Gas Estimation</h3>
                <div class="space-y-2 mb-4">
                    <p><strong>Network:</strong> ${
                      gasInfo.network.name ||
                      `Chain ID: ${gasInfo.network.chainId}`
                    }</p>
                    <p><strong>Gas Limit:</strong> ${parseInt(
                      gasInfo.gasLimit
                    ).toLocaleString()}</p>
                    <p><strong>Gas Price:</strong> ${gasInfo.gasPrice} Gwei</p>
                    <p class="text-lg"><strong>Estimated Cost:</strong> ${
                      gasInfo.estimatedCost
                    } ETH</p>
                    ${
                      gasInfo.network.chainId === 1
                        ? '<p class="text-red-500 text-sm">⚠️ This is Mainnet! Real ETH will be spent.</p>'
                        : ""
                    }
                </div>
                <div class="flex space-x-3">
                    <button onclick="resolveGasDialog(false)" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
                        Cancel
                    </button>
                    <button onclick="resolveGasDialog(true)" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Deploy
                    </button>
                </div>
            </div>
        `;

    window.resolveGasDialog = (value) => {
      document.body.removeChild(dialog);
      resolve(value);
    };

    document.body.appendChild(dialog);
  });
}

// Show contract interaction interface
function showContractInteraction(contractName, address, abi) {
  // Redirect to Interface Interaction instead
  showMessage("Redirecting to Interface Interaction...", "info");

  // Hide deployment section
  document.getElementById("deploymentSection").classList.add("hidden");

  // Show Interface Interaction
  const interfaceSection = document.getElementById(
    "interfaceInteractionSection"
  );
  if (interfaceSection) {
    interfaceSection.classList.remove("hidden");
  }

  // Pre-fill the address
  const addressInput = document.getElementById("interfaceContractAddress");
  if (addressInput) {
    addressInput.value = address;
  }

  // Update deployed contracts list
  showDeployedContractsQuickAccess();
  updateCurrentNetworkInfo();

  showMessage(
    `Use Interface Interaction to interact with ${contractName}`,
    "success"
  );
  return;

  // Show interaction section
  document.getElementById("interactionSection").classList.remove("hidden");

  // Switch to read tab by default
  switchTab("read");
}

// Populate contract functions
function populateFunctions(abi) {
  const readContainer = document.getElementById("readFunctions");
  const writeContainer = document.getElementById("writeFunctions");

  readContainer.innerHTML = "";
  writeContainer.innerHTML = "";

  abi.forEach((item, index) => {
    if (item.type === "function") {
      const functionDiv = createFunctionUI(item, index);

      if (item.stateMutability === "view" || item.stateMutability === "pure") {
        readContainer.appendChild(functionDiv);
      } else {
        writeContainer.appendChild(functionDiv);
      }
    }
  });

  // Show message if no functions
  if (readContainer.innerHTML === "") {
    readContainer.innerHTML =
      '<p class="text-gray-500">No read functions available</p>';
  }
  if (writeContainer.innerHTML === "") {
    writeContainer.innerHTML =
      '<p class="text-gray-500">No write functions available</p>';
  }
}

// Create function UI
function createFunctionUI(func, index) {
  const div = document.createElement("div");
  div.className = "border rounded p-4 bg-gray-50";

  let inputsHtml = "";
  if (func.inputs && func.inputs.length > 0) {
    inputsHtml = func.inputs
      .map(
        (input, i) => `
            <div class="mt-2">
                <label class="text-sm font-medium">${
                  input.name || "param" + i
                } (${input.type})</label>
                <input type="text"
                       id="func-${index}-input-${i}"
                       class="w-full border rounded px-3 py-2 mt-1"
                       placeholder="Enter ${input.type}">
            </div>
        `
      )
      .join("");
  }

  const isReadFunction =
    func.stateMutability === "view" || func.stateMutability === "pure";
  const buttonText = isReadFunction ? "Query" : "Execute";
  const buttonClass = isReadFunction
    ? "bg-blue-500 hover:bg-blue-600"
    : "bg-orange-500 hover:bg-orange-600";

  div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <h4 class="font-semibold">${func.name}</h4>
            ${
              !isReadFunction
                ? '<span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Payable</span>'
                : ""
            }
        </div>
        ${inputsHtml}
        <button onclick="executeFunction(${index}, ${isReadFunction})"
                class="${buttonClass} text-white px-4 py-2 rounded mt-3">
            ${buttonText}
        </button>
        <div id="func-${index}-result" class="mt-3 hidden"></div>
    `;

  return div;
}

// Execute contract function
async function executeFunction(funcIndex, isReadFunction) {
  if (!deployedContract) {
    showMessage("No contract instance available", "error");
    return;
  }

  const abi = deployedContract.interface.fragments;
  const func = abi[funcIndex];

  // Collect input values
  const inputs = [];
  if (func.inputs && func.inputs.length > 0) {
    for (let i = 0; i < func.inputs.length; i++) {
      const inputElement = document.getElementById(
        `func-${funcIndex}-input-${i}`
      );
      const value = inputElement.value.trim();

      if (!value) {
        showMessage(
          `Please provide value for ${func.inputs[i].name || "parameter " + i}`,
          "error"
        );
        return;
      }

      // Parse value based on type
      try {
        inputs.push(parseInputValue(value, func.inputs[i].type));
      } catch (error) {
        showMessage(
          `Invalid input for ${func.inputs[i].name}: ${error.message}`,
          "error"
        );
        return;
      }
    }
  }

  try {
    let result;

    if (isReadFunction) {
      // Call read function
      result = await deployedContract[func.name](...inputs);

      // Display result
      const resultDiv = document.getElementById(`func-${funcIndex}-result`);
      resultDiv.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded p-3">
                    <p class="text-sm font-semibold text-green-800">Result:</p>
                    <p class="font-mono text-sm mt-1">${formatResult(
                      result
                    )}</p>
                </div>
            `;
      resultDiv.classList.remove("hidden");
    } else {
      // Execute write function
      showMessage("Sending transaction...", "info");
      const tx = await deployedContract[func.name](...inputs);

      showMessage("Transaction sent. Waiting for confirmation...", "info");
      const receipt = await tx.wait();

      // Display result
      const resultDiv = document.getElementById(`func-${funcIndex}-result`);
      resultDiv.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded p-3">
                    <p class="text-sm font-semibold text-green-800">Transaction Successful!</p>
                    <p class="text-sm mt-1">Hash: <span class="font-mono">${
                      receipt.transactionHash
                    }</span></p>
                    <p class="text-sm">Gas Used: ${receipt.gasUsed.toString()}</p>
                </div>
            `;
      resultDiv.classList.remove("hidden");

      showMessage("Transaction confirmed!", "success");

      // Refresh events if on events tab
      if (
        !document.getElementById("eventsSection").classList.contains("hidden")
      ) {
        await refreshEvents();
      }
    }
  } catch (error) {
    console.error("Function call error:", error);

    // Extract detailed error message
    let errorMessage = error.message;

    // Extract revert reason from various error formats
    if (error.reason) {
      errorMessage = error.reason;
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (error.error && error.error.data && error.error.data.message) {
      errorMessage = error.error.data.message;
    } else if (error.message && error.message.includes("execution reverted:")) {
      // Extract revert reason from error message
      const match = error.message.match(/execution reverted: (.+)/);
      if (match) {
        errorMessage = match[1];
      }
    }

    // Handle specific error codes
    if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      // Check if there's a revert reason
      if (error.reason || (error.error && error.error.message)) {
        errorMessage = error.reason || error.error.message;
      }
    } else if (error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected by the user.";
    }

    // Display detailed error in result div
    const resultDiv = document.getElementById(`func-${funcIndex}-result`);
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded p-3">
          <p class="text-sm font-semibold text-red-800">Error:</p>
          <p class="text-sm mt-1 text-red-700">${errorMessage}</p>
        </div>
      `;
      resultDiv.classList.remove("hidden");
    }

    showMessage(`Function call failed: ${errorMessage}`, "error");
  }
}

// Parse input value based on type
function parseInputValue(value, type) {
  if (type === "address") {
    if (!ethers.utils.isAddress(value)) {
      throw new Error("Invalid address");
    }
    return value;
  } else if (type.startsWith("uint") || type.startsWith("int")) {
    return ethers.BigNumber.from(value);
  } else if (type === "bool") {
    return value.toLowerCase() === "true";
  } else if (type.startsWith("bytes")) {
    return value.startsWith("0x") ? value : "0x" + value;
  } else if (type.includes("[]")) {
    return value
      .split(",")
      .map((v) => parseInputValue(v.trim(), type.replace("[]", "")));
  }
  return value;
}

// Helper functions for base64 data formatting
function formatBase64JsonResult(dataUri) {
  try {
    const base64 = dataUri.replace("data:application/json;base64,", "");
    const jsonStr = atob(base64);
    const metadata = JSON.parse(jsonStr);

    let html = '<div class="space-y-2">';

    // Check if it's NFT metadata
    if (metadata.name && metadata.image) {
      html += `<div class="font-semibold">${metadata.name}</div>`;

      if (metadata.description) {
        html += `<div class="text-sm text-gray-600">${metadata.description}</div>`;
      }

      // Display image if it's SVG
      if (
        metadata.image &&
        metadata.image.startsWith("data:image/svg+xml;base64,")
      ) {
        const svgBase64 = metadata.image.replace(
          "data:image/svg+xml;base64,",
          ""
        );
        const svg = atob(svgBase64);
        html += `<div class="mt-2 p-2 bg-gray-100 rounded">
          <div style="width: 350px; height: 350px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <img src="${metadata.image}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </div>
        </div>`;
      }

      // Display attributes
      if (metadata.attributes && metadata.attributes.length > 0) {
        html +=
          '<div class="mt-2"><div class="text-sm font-semibold">Attributes:</div>';
        html += '<div class="grid grid-cols-2 gap-1 text-sm mt-1">';
        metadata.attributes.forEach((attr) => {
          html += `<div><span class="text-gray-600">${attr.trait_type}:</span> ${attr.value}</div>`;
        });
        html += "</div></div>";
      }
    } else {
      // Generic JSON display
      html += `<pre class="text-xs overflow-auto bg-gray-100 p-2 rounded">${JSON.stringify(
        metadata,
        null,
        2
      )}</pre>`;
    }

    html += "</div>";
    return html;
  } catch (error) {
    console.error("Failed to decode base64 JSON:", error);
    return `<span class="text-xs text-gray-500">${dataUri.substring(
      0,
      50
    )}...</span>`;
  }
}

function formatBase64SvgResult(dataUri) {
  try {
    const base64 = dataUri.replace("data:image/svg+xml;base64,", "");
    const svg = atob(base64);

    return `<div class="p-2 bg-gray-100 rounded">
      <div style="width: 350px; height: 350px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
        <img src="${dataUri}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
      </div>
    </div>`;
  } catch (error) {
    console.error("Failed to decode base64 SVG:", error);
    return `<span class="text-xs text-gray-500">${dataUri.substring(
      0,
      50
    )}...</span>`;
  }
}

// Format result for display
function formatResult(result) {
  if (result === null || result === undefined) {
    return "null";
  } else if (ethers.BigNumber.isBigNumber(result)) {
    return result.toString();
  } else if (typeof result === "object") {
    return JSON.stringify(result, null, 2);
  }

  // Check for base64 encoded data
  const resultStr = result.toString();
  if (resultStr.startsWith("data:application/json;base64,")) {
    return formatBase64JsonResult(resultStr);
  } else if (resultStr.startsWith("data:image/svg+xml;base64,")) {
    return formatBase64SvgResult(resultStr);
  }

  return resultStr;
}

// Switch between tabs
function switchTab(tab) {
  // Update tab styles
  const tabs = ["read", "write", "events"];
  tabs.forEach((t) => {
    const tabButton = document.getElementById(`${t}Tab`);
    if (t === tab) {
      tabButton.className =
        "px-4 py-2 font-semibold text-blue-600 border-b-2 border-blue-600";
    } else {
      tabButton.className =
        "px-4 py-2 font-semibold text-gray-600 hover:text-gray-800";
    }
  });

  // Show/hide content
  document
    .getElementById("readFunctions")
    .classList.toggle("hidden", tab !== "read");
  document
    .getElementById("writeFunctions")
    .classList.toggle("hidden", tab !== "write");
  document
    .getElementById("eventsSection")
    .classList.toggle("hidden", tab !== "events");

  // Load events when switching to events tab
  if (tab === "events" && deployedContract) {
    refreshEvents();
  }
}

// Refresh event logs
async function refreshEvents() {
  if (!deployedContract) {
    showMessage("No contract instance available", "error");
    return;
  }

  const eventLogsContainer = document.getElementById("eventLogs");
  eventLogsContainer.innerHTML =
    '<p class="text-gray-500">Loading events...</p>';

  try {
    // Get all events from the contract
    const filter = deployedContract.filters;
    const events = await deployedContract.queryFilter(filter);

    if (events.length === 0) {
      eventLogsContainer.innerHTML =
        '<p class="text-gray-500">No events found</p>';
      return;
    }

    // Display events
    eventLogsContainer.innerHTML = events
      .map(
        (event, index) => `
            <div class="border rounded p-3 bg-gray-50">
                <div class="flex justify-between items-start mb-2">
                    <h5 class="font-semibold">${event.event}</h5>
                    <span class="text-xs text-gray-500">Block #${
                      event.blockNumber
                    }</span>
                </div>
                <div class="text-sm space-y-1">
                    ${Object.entries(event.args || {})
                      .filter(([key]) => isNaN(key)) // Filter out numeric keys
                      .map(
                        ([key, value]) => `
                            <p><span class="font-medium">${key}:</span> ${formatResult(
                          value
                        )}</p>
                        `
                      )
                      .join("")}
                </div>
                <p class="text-xs text-gray-500 mt-2">Tx: ${event.transactionHash.substring(
                  0,
                  10
                )}...</p>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error(error);
    eventLogsContainer.innerHTML = `<p class="text-red-500">Failed to load events: ${error.message}</p>`;
  }
}

// Shared Contracts Management
function toggleSharedContractsDialog() {
  const dialog = document.getElementById("sharedContractsDialog");
  dialog.classList.toggle("hidden");

  if (!dialog.classList.contains("hidden")) {
    renderSharedContracts();
  }
}

function renderSharedContracts() {
  const container = document.getElementById("sharedContractsList");

  if (sharedContracts.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 text-sm">No shared contracts configured</p>';
    return;
  }

  container.innerHTML = sharedContracts
    .map(
      (contract, index) => `
        <div class="flex items-center justify-between p-2 bg-white rounded border">
            <div class="flex-1">
                <p class="font-medium text-sm">${
                  contract.name || contract.from.split("/").pop()
                }</p>
                <p class="text-xs text-gray-600">From: ${contract.from}</p>
            </div>
            <button onclick="removeSharedContract(${index})" class="text-red-500 hover:text-red-700 px-2">
                ×
            </button>
        </div>
    `
    )
    .join("");
}

async function addSharedContract() {
  try {
    // Get list of all projects
    const response = await fetch("/api/projects");
    const data = await response.json();
    const projects = data.projects.filter((p) => p !== selectedProject);

    if (projects.length === 0) {
      showMessage("No other projects available to import from", "warning");
      return;
    }

    // Show project selection dialog
    const sourceProject = prompt(
      `Select source project:\n${projects
        .map((p, i) => `${i + 1}. ${p}`)
        .join("\n")}\n\nEnter project number:`
    );

    if (
      !sourceProject ||
      isNaN(sourceProject) ||
      sourceProject < 1 ||
      sourceProject > projects.length
    ) {
      return;
    }

    const projectName = projects[parseInt(sourceProject) - 1];

    // Get contracts from selected project
    const contractsResponse = await fetch(
      `/api/projects/${projectName}/contracts`
    );
    const contractsData = await contractsResponse.json();
    const contractNames = Object.keys(contractsData.contracts);

    if (contractNames.length === 0) {
      showMessage("No compiled contracts found in selected project", "warning");
      return;
    }

    // Show contract selection
    const contractIndex = prompt(
      `Select contract to import:\n${contractNames
        .map((c, i) => `${i + 1}. ${c}`)
        .join("\n")}\n\nEnter contract number:`
    );

    if (
      !contractIndex ||
      isNaN(contractIndex) ||
      contractIndex < 1 ||
      contractIndex > contractNames.length
    ) {
      return;
    }

    const contractName = contractNames[parseInt(contractIndex) - 1];

    // Add to shared contracts
    sharedContracts.push({
      from: `${projectName}/contracts/${contractName}.sol`,
      name: `${contractName}.sol`,
    });

    renderSharedContracts();
    showMessage(`Added ${contractName} from ${projectName}`, "success");
  } catch (error) {
    showMessage("Failed to add shared contract: " + error.message, "error");
  }
}

function removeSharedContract(index) {
  sharedContracts.splice(index, 1);
  renderSharedContracts();
}

// Expose removeSharedContract globally for onclick handler
window.removeSharedContract = removeSharedContract;

// Function to remove a deployed contract from history
async function removeDeployedContract(contractName) {
  try {
    if (
      !confirm(
        `Remove ${contractName} from deployment history?\n\nThis will allow you to redeploy this contract.`
      )
    ) {
      return;
    }

    // Remove from window.deployedContracts
    if (window.deployedContracts && window.deployedContracts[contractName]) {
      delete window.deployedContracts[contractName];
    }

    // Remove from deployedAddresses
    if (deployedAddresses[contractName]) {
      delete deployedAddresses[contractName];
    }

    // Update localStorage
    const projectName = document.getElementById("projectSelect").value;
    if (projectName) {
      const storageKey = `deployedContracts_${projectName}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify(window.deployedContracts)
      );
    }

    // Get network ID
    let networkId = "unknown";
    if (provider) {
      try {
        const network = await provider.getNetwork();
        networkId = network.chainId;
      } catch (e) {
        console.error("Failed to get network ID:", e);
      }
    }

    // Update server-side deployed-addresses file
    const response = await fetch(
      `/api/projects/${projectName}/save-deployed-addresses`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          networkId: networkId,
          addresses: window.deployedContracts,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update deployed addresses on server");
    }

    // Re-render deployment steps
    await checkDeployedAddresses();
    if (deploymentConfig) {
      renderDeploymentSteps();
    }

    showMessage(`${contractName} removed from deployment history`, "info");
  } catch (error) {
    console.error("Failed to remove deployed contract:", error);
    showMessage(`Failed to remove ${contractName}: ${error.message}`, "error");
  }
}

// Expose removeDeployedContract globally for onclick handler
window.removeDeployedContract = removeDeployedContract;

// Complex deployment support
let deploymentConfig = null;
let deployedAddresses = {};
let currentDeploymentStep = 0;

async function checkDeploymentConfig() {
  if (!selectedProject) {
    console.log("No project selected");
    return;
  }

  console.log("Checking deployment config for project:", selectedProject);

  try {
    const response = await fetch(
      `/api/projects/${selectedProject}/deploy-config`
    );
    const data = await response.json();

    console.log("Deploy config response:", data);

    if (data.success && data.hasConfig) {
      deploymentConfig = data.config;
      console.log("Complex deployment config found, showing UI");
      showComplexDeploymentUI();
    } else {
      deploymentConfig = null;
      console.log("No complex deployment config found");
      hideComplexDeploymentUI();
    }
  } catch (error) {
    console.error("Failed to check deployment config:", error);
    deploymentConfig = null;
    hideComplexDeploymentUI();
  }
}

function showComplexDeploymentUI() {
  // Hide normal deploy button and show complex deployment UI
  const deployBtn = document.getElementById("deployBtn");
  const contractsContainer = document.getElementById("contractsContainer");
  const contractsList = document.getElementById("contractsList");

  // Create complex deployment UI if it doesn't exist
  let complexDeployUI = document.getElementById("complexDeployUI");
  if (!complexDeployUI) {
    complexDeployUI = document.createElement("div");
    complexDeployUI.id = "complexDeployUI";
    complexDeployUI.className = "mt-4 p-4 bg-purple-50 rounded-lg";
    complexDeployUI.innerHTML = `
            <h3 class="text-lg font-semibold mb-2">Complex Deployment Configuration Detected</h3>
            <p class="text-sm text-gray-600 mb-3">This project requires deploying ${deploymentConfig.deploymentOrder.reduce(
              (sum, step) => sum + step.contracts.length,
              0
            )} contracts in ${
      deploymentConfig.deploymentOrder.length
    } steps.</p>
            <div id="deployedAddresses" class="mb-4 p-3 bg-blue-50 rounded hidden">
                <h4 class="text-sm font-semibold mb-2">Previously Deployed Contracts:</h4>
                <div id="deployedList" class="text-xs space-y-1"></div>
            </div>
            <div id="deploymentSteps" class="space-y-2 mb-4"></div>
            <button id="startComplexDeploy" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                Start Deployment Process
            </button>
            <button id="resumeDeploy" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2 hidden">
                Resume Deployment
            </button>
            <button id="resetDeploy" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2">
                Reset
            </button>
        `;
    // Insert after contracts list
    if (contractsList) {
      contractsList.parentNode.insertBefore(
        complexDeployUI,
        contractsList.nextSibling
      );
    } else {
      // Fallback: insert after deploy button
      deployBtn.parentNode.insertBefore(complexDeployUI, deployBtn.nextSibling);
    }

    // Add event listeners
    document
      .getElementById("startComplexDeploy")
      .addEventListener("click", startComplexDeployment);
    document
      .getElementById("resetDeploy")
      .addEventListener("click", resetDeployment);
    document
      .getElementById("resumeDeploy")
      .addEventListener("click", resumeComplexDeployment);
  }

  // Check for existing deployed addresses
  checkDeployedAddresses();

  // Hide normal deployment controls
  if (deployBtn) deployBtn.style.display = "none";
  if (contractsList) contractsList.style.display = "none";

  // Show deployment steps
  renderDeploymentSteps();
}

// New function to check deployed addresses
async function checkDeployedAddresses() {
  try {
    const projectName = document.getElementById("projectSelect").value;
    if (!projectName) return;

    // Get network ID
    let networkId = "unknown";
    if (provider) {
      try {
        const network = await provider.getNetwork();
        networkId = network.chainId;
      } catch (e) {
        console.error("Failed to get network ID:", e);
      }
    }

    const response = await fetch(
      `/api/projects/${projectName}/deployed-addresses-${networkId}.json`
    );

    if (response.ok) {
      const deployedAddresses = await response.json();
      window.deployedContracts = deployedAddresses;

      // Show deployed addresses UI
      const deployedDiv = document.getElementById("deployedAddresses");
      const deployedList = document.getElementById("deployedList");

      if (
        deployedDiv &&
        deployedList &&
        Object.keys(deployedAddresses).length > 0
      ) {
        deployedDiv.classList.remove("hidden");
        deployedList.innerHTML = Object.entries(deployedAddresses)
          .map(
            ([name, address]) => `
            <div class="flex justify-between items-center group hover:bg-gray-50 p-1 rounded">
              <span class="font-mono">${name}:</span>
              <div class="flex items-center gap-2">
                <span class="text-gray-600">${address.slice(
                  0,
                  6
                )}...${address.slice(-4)}</span>
                <button onclick="copyAddress('${address}')" class="text-blue-500 hover:text-blue-700" title="Copy address">📋</button>
                <button onclick="removeDeployedContract('${name}')"
                        class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-lg leading-none px-1"
                        title="Remove ${name} from deployment history">
                  ×
                </button>
              </div>
            </div>
          `
          )
          .join("");

        // Show resume button if it exists
        const resumeBtn = document.getElementById("resumeDeploy");
        if (resumeBtn) {
          resumeBtn.classList.remove("hidden");
        }

        // Update deployment steps to show completed contracts
        updateDeploymentStepsWithDeployed(deployedAddresses);
      }
    } else if (response.status === 404) {
      // No deployed addresses yet - this is normal for new projects
      window.deployedContracts = {};
    }
  } catch (error) {
    // Network error or other issues - fail silently
    console.debug("Could not load deployed addresses:", error.message);
    window.deployedContracts = {};
  }
}

// Function to update deployment steps with deployed contracts
function updateDeploymentStepsWithDeployed(deployedAddresses) {
  if (!deploymentConfig) return;

  // Find the first incomplete step
  let firstIncompleteStep = -1;

  for (let i = 0; i < deploymentConfig.deploymentOrder.length; i++) {
    const step = deploymentConfig.deploymentOrder[i];
    const allDeployed = step.contracts.every(
      (contract) => deployedAddresses[contract.name]
    );

    if (!allDeployed) {
      firstIncompleteStep = i;
      break;
    }
  }

  if (firstIncompleteStep >= 0) {
    currentDeploymentStep = firstIncompleteStep;
  }

  renderDeploymentSteps();
}

// Function to resume deployment
async function resumeComplexDeployment() {
  if (!deploymentConfig || !window.deployedContracts) return;

  // Start from the current incomplete step
  startComplexDeployment();
}

function hideComplexDeploymentUI() {
  const complexDeployUI = document.getElementById("complexDeployUI");
  if (complexDeployUI) {
    complexDeployUI.remove();
  }

  // Show normal deployment controls
  const deployBtn = document.getElementById("deployBtn");
  const contractsList = document.getElementById("contractsList");

  if (deployBtn) deployBtn.style.display = "";
  if (contractsList) contractsList.style.display = "";
}

function renderDeploymentSteps() {
  const stepsContainer = document.getElementById("deploymentSteps");
  if (!stepsContainer || !deploymentConfig) return;

  stepsContainer.innerHTML = deploymentConfig.deploymentOrder
    .map((step, index) => {
      const isCompleted = index < currentDeploymentStep;
      const isActive = index === currentDeploymentStep;
      const statusIcon = isCompleted ? "✅" : isActive ? "🔄" : "⏳";
      const stepHasArgs = step.contracts.some(
        (c) => c.constructorArgs && c.constructorArgs.length > 0
      );

      return `
            <div class="p-3 border rounded ${
              isActive ? "border-purple-500 bg-purple-100" : "border-gray-300"
            }">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold">${statusIcon} Step ${
        step.step
      }: Deploy ${step.contracts.length} contract(s)</h4>
                    <div class="flex items-center gap-2">
                      ${
                        isActive
                          ? '<span class="text-sm text-purple-600">Active</span>'
                          : ""
                      }
                      ${
                        !isCompleted && stepHasArgs
                          ? `<button onclick="toggleStepArgs(${index})" class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">⚙️ Config</button>`
                          : ""
                      }
                      ${
                        !isCompleted && index >= currentDeploymentStep
                          ? `<button onclick="startFromStep(${index})" class="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Start Step</button>`
                          : ""
                      }
                    </div>
                </div>
                <ul class="mt-2 text-sm text-gray-600">
                    ${step.contracts
                      .map((c) => {
                        const address =
                          deployedAddresses[c.name] ||
                          (window.deployedContracts &&
                            window.deployedContracts[c.name]);
                        const isDeployed = !!address;
                        return `
                        <li class="ml-4 ${
                          isDeployed ? "text-green-600" : ""
                        }" id="contract-${c.name}">
                          <span class="font-medium">• ${c.name}</span>
                          ${
                            address
                              ? `<span class="ml-2 font-mono text-xs">✅ ${address.substring(
                                  0,
                                  6
                                )}...${address.substring(
                                  address.length - 4
                                )}</span>
                                 <button onclick="copyAddress('${address}')" class="ml-1 text-blue-500 hover:text-blue-700" title="Copy address">📋</button>`
                              : `<span class="ml-2 text-gray-400 text-xs">pending</span>`
                          }
                        </li>
                    `;
                      })
                      .join("")}
                </ul>
                <div id="step-args-${index}" class="mt-3 p-3 bg-gray-50 rounded hidden">
                  <h5 class="text-sm font-semibold mb-2">Constructor Arguments:</h5>
                  ${renderStepArgsForm(step, index)}
                </div>
            </div>
        `;
    })
    .join("");
}

// New function to update contract address in UI immediately
function updateContractAddressInUI(contractName, address) {
  const contractElement = document.getElementById(`contract-${contractName}`);
  if (contractElement) {
    contractElement.classList.add("text-green-600");
    contractElement.innerHTML = `
      <span class="font-medium">• ${contractName}</span>
      <span class="ml-2 font-mono text-xs">✅ ${address.substring(
        0,
        6
      )}...${address.substring(address.length - 4)}</span>
      <button onclick="copyAddress('${address}')" class="ml-1 text-blue-500 hover:text-blue-700" title="Copy address">📋</button>
    `;
  }
}

// Function to copy address to clipboard
function copyAddress(address) {
  navigator.clipboard
    .writeText(address)
    .then(() => {
      showMessage(`Address ${address} copied to clipboard!`, "success");
    })
    .catch((err) => {
      console.error("Failed to copy address:", err);
      showMessage("Failed to copy address", "error");
    });
}

// Function to toggle step arguments form
function toggleStepArgs(stepIndex) {
  const argsDiv = document.getElementById(`step-args-${stepIndex}`);
  if (argsDiv) {
    argsDiv.classList.toggle("hidden");
  }
}

// Function to render step arguments form
function renderStepArgsForm(step, stepIndex) {
  let formHtml = '<div class="space-y-2">';

  step.contracts.forEach((contract, contractIndex) => {
    if (contract.constructorArgs && contract.constructorArgs.length > 0) {
      formHtml += `
        <div class="border-t pt-2">
          <h6 class="text-xs font-semibold text-gray-700">${contract.name}:</h6>
          <div class="space-y-1 mt-1">
      `;

      contract.constructorArgs.forEach((arg, argIndex) => {
        const inputId = `arg-${stepIndex}-${contractIndex}-${argIndex}`;
        const defaultValue = typeof arg === "object" && arg.ref ? arg.ref : arg;
        formHtml += `
          <div class="flex items-center space-x-2">
            <label class="text-xs text-gray-600 w-24" for="${inputId}">Arg ${
          argIndex + 1
        }:</label>
            <input
              id="${inputId}"
              type="text"
              value="${defaultValue}"
              class="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter value or reference"
            />
          </div>
        `;
      });

      formHtml += "</div></div>";
    }
  });

  formHtml += `
    <button
      onclick="updateStepArgs(${stepIndex})"
      class="mt-2 bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600"
    >
      Update Arguments
    </button>
  </div>`;

  return formHtml;
}

// Function to update step arguments
function updateStepArgs(stepIndex) {
  const step = deploymentConfig.deploymentOrder[stepIndex];

  step.contracts.forEach((contract, contractIndex) => {
    if (contract.constructorArgs && contract.constructorArgs.length > 0) {
      contract.constructorArgs.forEach((arg, argIndex) => {
        const inputId = `arg-${stepIndex}-${contractIndex}-${argIndex}`;
        const input = document.getElementById(inputId);
        if (input) {
          const value = input.value;
          // Check if it's a reference
          if (value.includes(".address")) {
            contract.constructorArgs[argIndex] = { ref: value };
          } else {
            // Try to parse as number if it looks like one
            if (!isNaN(value) && value !== "") {
              contract.constructorArgs[argIndex] = value.includes(".")
                ? parseFloat(value)
                : parseInt(value);
            } else {
              contract.constructorArgs[argIndex] = value;
            }
          }
        }
      });
    }
  });

  showMessage(`Arguments updated for step ${step.step}`, "success");
  toggleStepArgs(stepIndex);
}

// Function to start deployment from specific step
async function startFromStep(stepIndex) {
  if (!deploymentConfig || !signer) {
    showMessage(
      "Cannot start deployment: missing configuration or wallet",
      "error"
    );
    return;
  }

  // Merge window.deployedContracts into deployedAddresses
  if (window.deployedContracts) {
    Object.assign(deployedAddresses, window.deployedContracts);
  }

  // Ensure we have all addresses from previous steps
  for (let i = 0; i < stepIndex; i++) {
    const step = deploymentConfig.deploymentOrder[i];
    for (const contract of step.contracts) {
      if (!deployedAddresses[contract.name]) {
        showMessage(
          `Missing required contract ${contract.name} from step ${step.step}. Please deploy previous steps first.`,
          "error"
        );
        return;
      }
    }
  }

  currentDeploymentStep = stepIndex;
  renderDeploymentSteps();

  // Continue with normal deployment flow from this step
  startComplexDeployment();
}

async function startComplexDeployment() {
  if (!deploymentConfig || !signer) {
    showMessage(
      "Cannot start deployment: missing configuration or wallet",
      "error"
    );
    return;
  }

  try {
    // Deploy step by step
    for (
      let i = currentDeploymentStep;
      i < deploymentConfig.deploymentOrder.length;
      i++
    ) {
      currentDeploymentStep = i;
      renderDeploymentSteps();

      const step = deploymentConfig.deploymentOrder[i];
      showMessage(`Deploying step ${step.step}...`, "info");

      // Get deployment data for this step
      const response = await fetch(
        `/api/projects/${selectedProject}/deploy-step`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: step.step,
            deployedAddresses: deployedAddresses,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Deploy step error:", errorData);
        throw new Error(
          `Failed to get deployment data for step ${step.step}: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const deployData = await response.json();

      // Deploy contracts in this step
      if (deployData.parallel && step.contracts.length > 1) {
        // Deploy in parallel
        showMessage(
          `Deploying ${step.contracts.length} contracts in parallel...`,
          "info"
        );
        // Filter out already deployed contracts
        const contractsToDeploy = deployData.deploymentData.filter(
          (data) =>
            !window.deployedContracts ||
            !window.deployedContracts[data.contractName]
        );

        // Deploy contracts in parallel but handle results individually
        const deployPromises = contractsToDeploy.map(async (data) => {
          try {
            const address = await deployContractWithData(data);
            // Address is already saved in deployContractWithData
            return { success: true, contractName: data.contractName, address };
          } catch (error) {
            console.error(`Failed to deploy ${data.contractName}:`, error);
            return {
              success: false,
              contractName: data.contractName,
              error: error.message,
            };
          }
        });

        // Add already deployed contracts to results
        deployData.deploymentData.forEach((data) => {
          if (
            window.deployedContracts &&
            window.deployedContracts[data.contractName]
          ) {
            deployedAddresses[data.contractName] =
              window.deployedContracts[data.contractName];
          }
        });
        // Wait for all deployments to complete
        const results = await Promise.all(deployPromises);

        // Check if any deployments failed
        const failedDeployments = results.filter((r) => !r.success);
        if (failedDeployments.length > 0) {
          const failedNames = failedDeployments
            .map((f) => f.contractName)
            .join(", ");
          throw new Error(`Failed to deploy: ${failedNames}`);
        }
      } else {
        // Deploy sequentially
        for (const data of deployData.deploymentData) {
          if (
            window.deployedContracts &&
            window.deployedContracts[data.contractName]
          ) {
            deployedAddresses[data.contractName] =
              window.deployedContracts[data.contractName];
            showMessage(
              `${data.contractName} already deployed, using existing address`,
              "info"
            );
          } else {
            showMessage(`Deploying ${data.contractName}...`, "info");
            const address = await deployContractWithData(data);
            deployedAddresses[data.contractName] = address;
            // Update UI immediately after deployment
            updateContractAddressInUI(data.contractName, address);
          }

          // Execute post-deployment functions if any
          if (data.postDeploy && data.postDeploy.length > 0) {
            for (const postDeploy of data.postDeploy) {
              showMessage(
                `Executing ${postDeploy.method} on ${data.contractName}...`,
                "info"
              );
              await executePostDeploy(
                deployedAddresses[data.contractName],
                data.abi,
                postDeploy
              );
            }
          }
        }
      }

      currentDeploymentStep = i + 1;
      renderDeploymentSteps();
    }

    showMessage("Complex deployment completed successfully!", "success");

    // Save deployed addresses
    await saveDeployedAddresses();

    // Show deployment summary
    showDeploymentSummary();
  } catch (error) {
    showMessage("Deployment failed: " + error.message, "error");
    console.error("Deployment error:", error);
  }
}

async function deployContractWithData(deployData) {
  // Check if already deployed
  if (
    window.deployedContracts &&
    window.deployedContracts[deployData.contractName]
  ) {
    const existingAddress = window.deployedContracts[deployData.contractName];
    showMessage(
      `${deployData.contractName} already deployed at ${existingAddress}, skipping...`,
      "info"
    );
    return existingAddress;
  }
  const factory = new ethers.ContractFactory(
    deployData.abi,
    deployData.bytecode,
    signer
  );

  console.log(
    `Deploying ${deployData.contractName} with args:`,
    deployData.constructorArgs
  );

  // Get network and prepare deploy options
  const network = await provider.getNetwork();
  let deployOptions = {};

  // Estimate gas
  try {
    const deployTransaction = factory.getDeployTransaction(
      ...deployData.constructorArgs
    );
    const gasEstimate = await provider.estimateGas(deployTransaction);
    deployOptions.gasLimit = gasEstimate.mul(150).div(100); // 50% buffer
  } catch (error) {
    console.error(
      `Gas estimation failed for ${deployData.contractName}, using default`
    );
    // Use high default gas limit for Amoy
    if (network.chainId === 80002) {
      // Large contracts need more gas
      if (
        deployData.contractName === "TragedyMetadata" ||
        deployData.contractName === "BankedNFT"
      ) {
        deployOptions.gasLimit = ethers.BigNumber.from("10000000"); // 10M gas
      } else {
        deployOptions.gasLimit = ethers.BigNumber.from("5000000"); // 5M gas
      }
    } else {
      deployOptions.gasLimit = ethers.BigNumber.from("3000000"); // 3M gas default
    }
  }

  // For Amoy, double the gas price
  if (network.chainId === 80002) {
    const gasPrice = await provider.getGasPrice();
    deployOptions.gasPrice = gasPrice.mul(2);
  }

  const contract = await factory.deploy(
    ...deployData.constructorArgs,
    deployOptions
  );

  // Show deploying status
  showMessage(`Waiting for ${deployData.contractName} to be mined...`, "info");

  await contract.deployed();

  console.log(`${deployData.contractName} deployed at:`, contract.address);

  // Update UI immediately when deployment is confirmed
  updateContractAddressInUI(deployData.contractName, contract.address);
  showMessage(
    `${deployData.contractName} deployed successfully at ${contract.address}`,
    "success"
  );

  // Save deployed address immediately
  await saveDeployedAddressIncremental(
    deployData.contractName,
    contract.address
  );

  return contract.address;
}

async function executePostDeploy(contractAddress, abi, postDeploy) {
  const contract = new ethers.Contract(contractAddress, abi, signer);

  // Process arguments, replacing references
  const args = postDeploy.args.map((arg) => {
    if (arg && typeof arg === "object" && arg.ref) {
      const refParts = arg.ref.split(".");
      const contractName = refParts[0];
      return deployedAddresses[contractName] || arg;
    }
    return arg;
  });

  const tx = await contract[postDeploy.method](...args);
  await tx.wait();
  console.log(`Executed ${postDeploy.method} on ${contractAddress}`);
}

function resetDeployment() {
  currentDeploymentStep = 0;
  deployedAddresses = {};
  renderDeploymentSteps();
  showMessage("Deployment reset", "info");
}

async function saveDeployedAddresses() {
  try {
    const projectName = document.getElementById("projectSelect").value;
    const response = await fetch(
      `/api/projects/${projectName}/save-deployed-addresses`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deployedAddresses),
      }
    );

    if (response.ok) {
      showMessage(
        "Deployed addresses saved to deployed-addresses.json",
        "success"
      );
    }
  } catch (error) {
    console.error("Failed to save deployed addresses:", error);
  }
}

// Save single deployed address immediately
async function saveDeployedAddressIncremental(contractName, address) {
  try {
    const projectName = document.getElementById("projectSelect").value;

    // Get network ID
    let networkId = "unknown";
    if (provider) {
      try {
        const network = await provider.getNetwork();
        networkId = network.chainId;
      } catch (e) {
        console.error("Failed to get network ID:", e);
      }
    }

    // Update local deployed addresses
    deployedAddresses[contractName] = address;
    if (!window.deployedContracts) {
      window.deployedContracts = {};
    }
    window.deployedContracts[contractName] = address;

    // Save to server
    const response = await fetch(
      `/api/projects/${projectName}/save-deployed-addresses`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          networkId: networkId,
          addresses: deployedAddresses,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to save deployed address incrementally");
    }
  } catch (error) {
    console.error("Failed to save deployed address:", error);
  }
}

function showDeploymentSummary() {
  // Create a nice summary UI instead of alert
  const summaryDiv = document.createElement("div");
  summaryDiv.className =
    "mt-4 p-4 bg-green-50 border border-green-200 rounded-lg";
  summaryDiv.innerHTML = `
        <h3 class="text-lg font-semibold text-green-800 mb-3">🎉 Deployment Complete!</h3>
        <p class="text-sm text-gray-600 mb-3">All ${
          Object.keys(deployedAddresses).length
        } contracts have been successfully deployed.</p>
        <div class="space-y-2">
            <h4 class="font-semibold text-gray-700">Deployed Contracts:</h4>
            <div class="bg-white p-3 rounded border border-gray-200 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                ${Object.entries(deployedAddresses)
                  .map(
                    ([name, address]) =>
                      `<div class="flex justify-between items-center p-1 hover:bg-gray-50">
                        <span class="font-semibold">${name}:</span>
                        <span class="text-gray-600">${address}</span>
                        <button onclick="navigator.clipboard.writeText('${address}')" class="ml-2 text-blue-500 hover:text-blue-700">
                            📋
                        </button>
                    </div>`
                  )
                  .join("")}
            </div>
        </div>
        <div class="mt-4 flex gap-2">
            <button id="downloadDeploymentData" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                💾 Download Deployment Data
            </button>
            <button id="copyAllAddresses" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                📋 Copy All Addresses
            </button>
            <button id="openInterfaceInteraction" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                🔧 Use Interface Interaction
            </button>
        </div>
    `;

  // Insert summary after the complex deployment UI
  const complexDeployUI = document.getElementById("complexDeployUI");
  if (complexDeployUI && complexDeployUI.parentNode) {
    complexDeployUI.parentNode.insertBefore(
      summaryDiv,
      complexDeployUI.nextSibling
    );
  }

  // Add event listeners
  setTimeout(() => {
    // Open Interface Interaction button
    const openInterfaceBtn = document.getElementById(
      "openInterfaceInteraction"
    );
    if (openInterfaceBtn) {
      openInterfaceBtn.addEventListener("click", () => {
        // Hide deployment UI
        hideComplexDeploymentUI();

        // Show interface interaction section
        const interfaceSection = document.getElementById(
          "interfaceInteractionSection"
        );
        if (interfaceSection) {
          interfaceSection.classList.remove("hidden");
        }

        // Hide normal interaction section
        const interactionSection =
          document.getElementById("interactionSection");
        if (interactionSection) {
          interactionSection.classList.add("hidden");
        }

        // Update deployed contracts list
        showDeployedContractsQuickAccess();
        updateCurrentNetworkInfo();

        showMessage(
          "Use Interface Interaction to interact with your deployed contracts",
          "info"
        );
      });
    }

    const downloadBtn = document.getElementById("downloadDeploymentData");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        // Convert network ID to name
        const networkId = window.ethereum?.networkVersion || "1337";
        let networkName = "unknown";
        switch (networkId) {
          case "1":
            networkName = "mainnet";
            break;
          case "5":
            networkName = "goerli";
            break;
          case "11155111":
            networkName = "sepolia";
            break;
          case "137":
            networkName = "polygon";
            break;
          case "1337":
            networkName = "private";
            break;
          case "31337":
            networkName = "hardhat";
            break;
          default:
            networkName = `chain-${networkId}`;
        }

        const deploymentData = {
          network: networkName,
          timestamp: new Date().toISOString(),
          contracts: deployedAddresses,
        };

        const dataStr = JSON.stringify(deploymentData, null, 2);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

        const link = document.createElement("a");
        link.setAttribute("href", dataUri);
        link.setAttribute("download", `deployment.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    const copyAllBtn = document.getElementById("copyAllAddresses");
    if (copyAllBtn) {
      copyAllBtn.addEventListener("click", () => {
        const addressesText = Object.entries(deployedAddresses)
          .map(([name, address]) => `${name}: ${address}`)
          .join("\n");

        navigator.clipboard.writeText(addressesText).then(() => {
          showMessage("All addresses copied to clipboard!", "success");
        });
      });
    }
  }, 100); // Delay to ensure DOM is ready

  // Remove old NFT interaction code - use Interface Interaction instead

  // Also log to console for debugging
  console.log("Deployment Summary:", deployedAddresses);
}

// Extend project change handler to check for deploy config
const originalOnProjectChange = onProjectChange;
onProjectChange = async function (event) {
  // Hide interface interaction section and reset
  const interfaceSection = document.getElementById(
    "interfaceInteractionSection"
  );
  if (interfaceSection) interfaceSection.classList.add("hidden");

  const interfaceArea = document.getElementById("interfaceContractArea");
  if (interfaceArea) interfaceArea.classList.add("hidden");

  // Reset interface interaction form
  const contractSelect = document.getElementById("interfaceContractSelect");
  if (contractSelect) contractSelect.value = "";

  const contractAddress = document.getElementById("interfaceContractAddress");
  if (contractAddress) contractAddress.value = "";

  const networkSelect = document.getElementById("interfaceNetworkSelect");
  if (networkSelect) networkSelect.value = "current";

  // Clear any displayed functions and results
  const readFunctions = document.getElementById("interfaceReadFunctions");
  if (readFunctions) readFunctions.innerHTML = "";

  const writeFunctions = document.getElementById("interfaceWriteFunctions");
  if (writeFunctions) writeFunctions.innerHTML = "";

  const eventsList = document.getElementById("interfaceEventsList");
  if (eventsList) eventsList.innerHTML = "";

  // Reset current interface contract
  currentInterfaceContract = null;
  interfaceContracts = {};

  // Hide other interaction sections
  const interactionSection = document.getElementById("interactionSection");
  if (interactionSection) interactionSection.classList.add("hidden");

  const resultsSection = document.getElementById("resultsSection");
  if (resultsSection) resultsSection.classList.add("hidden");

  // Show compile & deploy section (default view)
  const compileDeploySection = document.getElementById("compileDeploySection");
  if (compileDeploySection) compileDeploySection.classList.remove("hidden");

  await originalOnProjectChange.call(this, event);
  await checkDeploymentConfig();
  await checkInterfaceDirectory();
};

// Interface-based Contract Interaction Functions
let interfaceContracts = {};
let currentInterfaceContract = null;

// Helper functions for parameter handling
function getPlaceholderForType(type) {
  if (type.includes("address")) return "0x...";
  if (type.includes("uint") || type.includes("int")) return "Enter number";
  if (type.includes("bool")) return "true or false";
  if (type.includes("string")) return "Enter text";
  if (type.includes("bytes32")) return "0x... (64 hex chars)";
  if (type.includes("bytes")) return "0x...";
  if (type.startsWith("tuple[]"))
    return '[["value1", value2, ...], ["value1", value2, ...]] or [{"field1": "value1", ...}, {...}]';
  if (type.startsWith("tuple"))
    return '["value1", value2, ...] or {"field1": "value1", "field2": value2, ...}';
  if (type.includes("[]")) return "[value1, value2, ...]";
  return `Enter ${type}`;
}

function parseParameterValue(value, type) {
  // Handle empty values
  if (!value && value !== 0 && value !== false) {
    if (type.includes("[]")) return [];
    if (type.includes("uint") || type.includes("int")) return 0;
    if (type === "bool") return false;
    if (type === "address") return ethers.constants.AddressZero;
    return value;
  }

  // Handle tuples (including nested tuples and tuple arrays)
  if (type.startsWith("tuple")) {
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(value);

      // If it's a tuple array
      if (type.includes("[]")) {
        if (!Array.isArray(parsed)) {
          throw new Error("Tuple array must be an array");
        }

        // For tuple[], we need to convert objects to arrays
        return parsed.map((item) => {
          if (Array.isArray(item)) {
            // Already in array format
            return item;
          } else if (typeof item === "object" && item !== null) {
            // Convert object to array based on property order
            // This assumes properties are in the correct order
            return Object.values(item);
          }
          return item;
        });
      } else {
        // Single tuple
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (typeof parsed === "object" && parsed !== null) {
          // Convert object to array
          return Object.values(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to parse tuple:", e);
      // If JSON parse fails, try to parse as comma-separated for simple tuples
      if (!type.includes("[]") && value.includes(",")) {
        return value.split(",").map((v) => v.trim());
      }
      throw new Error(
        `Invalid tuple format. Please use JSON format: ${
          type.includes("[]") ? "[{...}, {...}]" : "{...} or [...]"
        }`
      );
    }
  }

  // Arrays (non-tuple)
  if (type.includes("[]")) {
    try {
      const parsed = JSON.parse(value);
      const baseType = type.replace("[]", "");
      return parsed.map((v) => parseParameterValue(v, baseType));
    } catch {
      return value
        .split(",")
        .map((v) => parseParameterValue(v.trim(), type.replace("[]", "")));
    }
  }

  // Basic types
  if (type === "bool") return value === "true" || value === true;
  if (type.includes("uint") || type.includes("int")) {
    if (type.includes("uint256") || type.includes("int256")) {
      return ethers.BigNumber.from(value);
    }
    return parseInt(value);
  }
  if (type === "address") return ethers.utils.getAddress(value);
  if (type.includes("bytes32")) return ethers.utils.formatBytes32String(value);
  if (type.includes("bytes")) return value;

  return value;
}

function formatOutputValue(value, type) {
  if (value === null || value === undefined) return "null";

  // BigNumber
  if (ethers.BigNumber.isBigNumber(value)) {
    return value.toString();
  }

  // Arrays
  if (Array.isArray(value)) {
    return (
      "[" +
      value
        .map((v) => formatOutputValue(v, type.replace("[]", "")))
        .join(", ") +
      "]"
    );
  }

  // Address
  if (type === "address") {
    return value;
  }

  // Boolean
  if (type === "bool") {
    return value ? "true" : "false";
  }

  // Bytes
  if (type.includes("bytes")) {
    return value;
  }

  // Check for base64 encoded data
  const valueStr = value.toString();
  if (valueStr.startsWith("data:application/json;base64,")) {
    return formatBase64JsonResult(valueStr);
  } else if (valueStr.startsWith("data:image/svg+xml;base64,")) {
    return formatBase64SvgResult(valueStr);
  }

  // Default
  return valueStr;
}

async function checkInterfaceDirectory() {
  if (!selectedProject) return;

  try {
    const response = await fetch(`/api/projects/${selectedProject}/interfaces`);
    if (response.ok) {
      const interfaces = await response.json();
      const hasInterfaces = interfaces && interfaces.length > 0;

      // Load interface contracts if interfaces exist
      if (hasInterfaces) {
        loadInterfaceContracts(interfaces);
      }
    }
  } catch (error) {
    console.error("Failed to check interface directory:", error);
  }
}

function loadInterfaceContracts(interfaces) {
  interfaceContracts = {};
  const select = document.getElementById("interfaceContractSelect");
  select.innerHTML =
    '<option value="">Select a contract with interface...</option>';

  interfaces.forEach((file) => {
    if (file.endsWith(".abi.json")) {
      const contractName = file.replace(".abi.json", "");
      interfaceContracts[contractName] = file;
      const option = document.createElement("option");
      option.value = contractName;
      option.textContent = contractName;
      select.appendChild(option);
    }
  });
}

// Remove old interface interaction button event listener since we're using tabs now

// Update current network info display
async function updateCurrentNetworkInfo() {
  const networkInfo = document.getElementById("currentNetworkInfo");

  if (provider) {
    try {
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      let networkName = network.name;

      // Map common chain IDs to names
      const chainNames = {
        1: "Ethereum Mainnet",
        5: "Goerli Testnet",
        11155111: "Sepolia Testnet",
        137: "Polygon Mainnet",
        80001: "Mumbai Testnet",
        80002: "Amoy Testnet",
        56: "BSC Mainnet",
        97: "BSC Testnet",
        43114: "Avalanche Mainnet",
        43113: "Avalanche Testnet",
        42161: "Arbitrum One",
        421613: "Arbitrum Goerli",
        10: "Optimism Mainnet",
        420: "Optimism Goerli",
      };

      if (chainNames[chainId]) {
        networkName = chainNames[chainId];
      }

      networkInfo.innerHTML = `Currently connected to: <span class="font-semibold">${networkName}</span> (Chain ID: ${chainId})`;
    } catch (error) {
      networkInfo.innerHTML =
        '<span class="text-gray-500">Network information not available</span>';
    }
  } else {
    networkInfo.innerHTML =
      '<span class="text-gray-500">Please connect your wallet to see the current network</span>';
  }
}

// Network selection listener is now in initializeInterfaceInteractionListeners

// Load interface contract function
async function loadInterfaceContract() {
  const contractName = document.getElementById("interfaceContractSelect").value;
  const contractAddress = document.getElementById(
    "interfaceContractAddress"
  ).value;
  const network = document.getElementById("interfaceNetworkSelect").value;

  if (!contractName || !contractAddress) {
    showMessage("Please select a contract and enter an address", "error");
    return;
  }

  if (!ethers.utils.isAddress(contractAddress)) {
    showMessage("Invalid contract address", "error");
    return;
  }

  try {
    // Load ABI from interface directory
    const response = await fetch(
      `/api/projects/${selectedProject}/interface/${interfaceContracts[contractName]}`
    );
    if (!response.ok) {
      throw new Error("Failed to load ABI");
    }

    const abi = await response.json();

    // Handle network selection
    let useProvider = provider;
    let networkDisplay = network;

    if (network === "current") {
      // Use current connected provider
      if (!provider && !signer) {
        showMessage(
          "Please connect your wallet first to use the current network",
          "error"
        );
        return;
      }
      useProvider = provider || signer.provider;

      // Get network name for display
      try {
        const currentNetwork = await useProvider.getNetwork();
        const chainId = currentNetwork.chainId;
        const chainNames = {
          1: "Ethereum Mainnet",
          5: "Goerli Testnet",
          11155111: "Sepolia Testnet",
          137: "Polygon Mainnet",
          80001: "Mumbai Testnet",
          80002: "Amoy Testnet",
          56: "BSC Mainnet",
          97: "BSC Testnet",
          43114: "Avalanche Mainnet",
          43113: "Avalanche Testnet",
          42161: "Arbitrum One",
          421613: "Arbitrum Goerli",
          10: "Optimism Mainnet",
          420: "Optimism Goerli",
        };
        networkDisplay = chainNames[chainId] || `Chain ID: ${chainId}`;
      } catch {
        networkDisplay = "Current Network";
      }
    } else {
      // Use specific network
      if (!provider && !signer) {
        // Create a default provider for the selected network
        const networkMap = {
          polygon: "https://polygon-rpc.com",
          amoy: "https://rpc-amoy.polygon.technology",
          mainnet: "https://eth-mainnet.g.alchemy.com/v2/demo",
          sepolia: "https://rpc.sepolia.org",
        };

        if (networkMap[network]) {
          useProvider = new ethers.providers.JsonRpcProvider(
            networkMap[network]
          );
        } else {
          showMessage("Unknown network selected", "error");
          return;
        }
      }
    }

    // Update display
    document.getElementById("interfaceContractName").textContent = contractName;
    document.getElementById("interfaceContractAddressDisplay").textContent =
      contractAddress;
    document.getElementById("interfaceNetworkDisplay").textContent =
      networkDisplay;

    // Create contract instance with provider
    currentInterfaceContract = new ethers.Contract(
      contractAddress,
      abi,
      useProvider
    );

    // Verify contract by trying to get bytecode
    try {
      const code = await useProvider.getCode(contractAddress);
      if (code === "0x") {
        showMessage(
          `Warning: No contract found at ${contractAddress} on ${networkDisplay}. The contract may not be deployed on this network.`,
          "warning"
        );
      }
    } catch (e) {
      console.warn("Could not verify contract existence:", e);
    }

    // Show contract area
    document.getElementById("interfaceContractArea").classList.remove("hidden");

    // Load functions
    loadInterfaceFunctions(abi);

    showMessage(
      `Loaded ${contractName} at ${contractAddress} on ${networkDisplay}`,
      "success"
    );
  } catch (error) {
    showMessage("Failed to load contract: " + error.message, "error");
    console.error("Contract loading error:", error);
  }
}

// Initialize interface interaction event listeners
function initializeInterfaceInteractionListeners() {
  // Load interface contract button
  const loadInterfaceBtn = document.getElementById("loadInterfaceContract");
  if (loadInterfaceBtn) {
    loadInterfaceBtn.addEventListener("click", loadInterfaceContract);
  }

  // Interface tab switching
  const interfaceReadTab = document.getElementById("interfaceReadTab");
  if (interfaceReadTab) {
    interfaceReadTab.addEventListener("click", () => {
      switchInterfaceTab("read");
    });
  }

  const interfaceWriteTab = document.getElementById("interfaceWriteTab");
  if (interfaceWriteTab) {
    interfaceWriteTab.addEventListener("click", () => {
      switchInterfaceTab("write");
    });
  }

  const interfaceEventsTab = document.getElementById("interfaceEventsTab");
  if (interfaceEventsTab) {
    interfaceEventsTab.addEventListener("click", () => {
      switchInterfaceTab("events");
    });
  }

  // Interface events button
  const interfaceLoadEventsBtn = document.getElementById("interfaceLoadEvents");
  if (interfaceLoadEventsBtn) {
    interfaceLoadEventsBtn.addEventListener("click", loadInterfaceEvents);
  }

  // Network selection change
  const interfaceNetworkSelect = document.getElementById(
    "interfaceNetworkSelect"
  );
  if (interfaceNetworkSelect) {
    interfaceNetworkSelect.addEventListener("change", (e) => {
      if (e.target.value === "current") {
        updateCurrentNetworkInfo();
      }
    });
  }
}

function switchInterfaceTab(tab) {
  // Update tab styles
  const tabs = ["interfaceReadTab", "interfaceWriteTab", "interfaceEventsTab"];
  tabs.forEach((tabId) => {
    const tabEl = document.getElementById(tabId);
    if (tabId === `interface${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`) {
      tabEl.classList.add("text-blue-600", "border-b-2", "border-blue-600");
      tabEl.classList.remove("text-gray-600");
    } else {
      tabEl.classList.remove("text-blue-600", "border-b-2", "border-blue-600");
      tabEl.classList.add("text-gray-600");
    }
  });

  // Show/hide content
  document
    .getElementById("interfaceReadFunctions")
    .classList.toggle("hidden", tab !== "read");
  document
    .getElementById("interfaceWriteFunctions")
    .classList.toggle("hidden", tab !== "write");
  document
    .getElementById("interfaceEventsSection")
    .classList.toggle("hidden", tab !== "events");
}

function loadInterfaceFunctions(abi) {
  const readFunctions = [];
  const writeFunctions = [];

  abi.forEach((item) => {
    if (item.type === "function") {
      if (item.stateMutability === "view" || item.stateMutability === "pure") {
        readFunctions.push(item);
      } else {
        writeFunctions.push(item);
      }
    }
  });

  // Render read functions
  const readContainer = document.getElementById("interfaceReadFunctions");
  readContainer.innerHTML = "";
  readFunctions.forEach((func) => {
    readContainer.appendChild(createInterfaceFunctionUI(func, "read"));
  });

  // Render write functions
  const writeContainer = document.getElementById("interfaceWriteFunctions");
  writeContainer.innerHTML = "";
  writeFunctions.forEach((func) => {
    writeContainer.appendChild(createInterfaceFunctionUI(func, "write"));
  });
}

function createInterfaceFunctionUI(func, type) {
  const div = document.createElement("div");
  div.className = "border rounded p-4";

  const title = document.createElement("h4");
  title.className = "font-semibold mb-2";
  title.textContent = func.name;
  div.appendChild(title);

  // Create inputs for parameters
  if (func.inputs.length > 0) {
    func.inputs.forEach((input, index) => {
      const inputDiv = document.createElement("div");
      inputDiv.className = "mb-2";

      const label = document.createElement("label");
      label.className = "block text-sm font-medium mb-1";
      label.textContent = `${input.name || `param${index}`} (${input.type})`;
      inputDiv.appendChild(label);

      const inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.id = `interface-${func.name}-${index}`;
      inputEl.className = "w-full border rounded px-3 py-2 text-sm";
      inputEl.placeholder = getPlaceholderForType(input.type);
      inputDiv.appendChild(inputEl);

      div.appendChild(inputDiv);
    });
  }

  // Add ETH value input for payable functions
  if (func.stateMutability === "payable" && type === "write") {
    const ethDiv = document.createElement("div");
    ethDiv.className = "mb-2 border-t pt-2 mt-2";

    const ethLabel = document.createElement("label");
    ethLabel.className = "block text-sm font-medium mb-1 text-blue-600";
    ethLabel.textContent = "ETH Value to Send (in ETH)";
    ethDiv.appendChild(ethLabel);

    const ethInput = document.createElement("input");
    ethInput.type = "text";
    ethInput.id = `interface-${func.name}-eth-value`;
    ethInput.className = "w-full border rounded px-3 py-2 text-sm";
    ethInput.placeholder = "0.0";
    ethDiv.appendChild(ethInput);

    div.appendChild(ethDiv);
  }

  // Create button
  const button = document.createElement("button");
  button.className =
    type === "read"
      ? "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
      : "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2";
  button.textContent = type === "read" ? "Query" : "Execute";
  button.onclick = () => executeInterfaceFunction(func, type);
  div.appendChild(button);

  // Result area
  const resultDiv = document.createElement("div");
  resultDiv.id = `interface-result-${func.name}`;
  resultDiv.className = "mt-2 text-sm";
  div.appendChild(resultDiv);

  return div;
}

async function executeInterfaceFunction(func, type) {
  if (!currentInterfaceContract) {
    showMessage("No contract loaded", "error");
    return;
  }

  try {
    // Collect parameters
    const params = [];
    for (let i = 0; i < func.inputs.length; i++) {
      const inputEl = document.getElementById(`interface-${func.name}-${i}`);
      const value = inputEl.value;

      // Parse value based on type
      const parsedValue = parseParameterValue(value, func.inputs[i].type);
      params.push(parsedValue);
    }

    const resultDiv = document.getElementById(`interface-result-${func.name}`);

    if (type === "read") {
      // Call read function
      resultDiv.innerHTML = '<span class="text-gray-500">Querying...</span>';
      const result = await currentInterfaceContract[func.name](...params);

      // Format result
      let formattedResult;
      if (func.outputs.length === 1) {
        formattedResult = formatOutputValue(result, func.outputs[0].type);
      } else {
        formattedResult = func.outputs
          .map(
            (output, index) =>
              `${output.name || `output${index}`}: ${formatOutputValue(
                result[index],
                output.type
              )}`
          )
          .join("<br>");
      }

      resultDiv.innerHTML = `<div class="bg-green-50 p-2 rounded">${formattedResult}</div>`;
    } else {
      // Execute write function
      if (!signer) {
        showMessage(
          "Please connect your wallet to execute transactions",
          "error"
        );
        return;
      }

      // Connect contract with signer for write operations
      const contractWithSigner = currentInterfaceContract.connect(signer);

      resultDiv.innerHTML =
        '<span class="text-gray-500">Sending transaction...</span>';

      // Prepare transaction options
      let txOptions = {};

      // Add ETH value for payable functions
      if (func.stateMutability === "payable") {
        const ethValueInput = document.getElementById(
          `interface-${func.name}-eth-value`
        );
        if (ethValueInput && ethValueInput.value) {
          try {
            txOptions.value = ethers.utils.parseEther(ethValueInput.value);
          } catch (e) {
            showMessage("Invalid ETH value", "error");
            return;
          }
        }
      }

      // For functions that might need high gas (like mint), use manual gas limit
      if (
        func.name.toLowerCase().includes("mint") ||
        func.name.toLowerCase().includes("create") ||
        func.name.toLowerCase().includes("deploy")
      ) {
        // Use high gas limit for mint/create operations with on-chain data
        txOptions.gasLimit = 10000000; // 10M gas
      }

      const tx = await contractWithSigner[func.name](...params, txOptions);

      resultDiv.innerHTML = `<span class="text-blue-500">Transaction sent: ${tx.hash.substring(
        0,
        10
      )}...</span>`;

      const receipt = await tx.wait();
      resultDiv.innerHTML = `<div class="bg-green-50 p-2 rounded">Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}</div>`;
    }
  } catch (error) {
    const resultDiv = document.getElementById(`interface-result-${func.name}`);

    // More detailed error handling
    let errorMessage = error.message;

    // Log full error for debugging
    console.error("Full error object:", error);

    // Check if there's nested error data
    if (error.data) {
      console.error("Error data:", error.data);
    }

    // Handle MetaMask RPC errors
    if (error.code === -32603) {
      // Internal JSON-RPC error - try to get more details
      if (error.data && error.data.message) {
        errorMessage = `MetaMask error: ${error.data.message}`;
      } else if (error.stack && error.stack.includes("message")) {
        // Try to extract message from stack
        const stackMatch = error.stack.match(/"message":\s*"([^"]+)"/);
        if (stackMatch) {
          errorMessage = `MetaMask error: ${stackMatch[1]}`;
        }
      } else {
        errorMessage =
          "MetaMask internal error. Please check: 1) Gas limit, 2) ETH balance, 3) Network connection";
      }
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (error.error && error.error.data && error.error.data.message) {
      errorMessage = error.error.data.message;
    } else if (error.message && error.message.includes("execution reverted:")) {
      // Extract revert reason from error message
      const match = error.message.match(/execution reverted: (.+)/);
      if (match) {
        errorMessage = match[1];
      }
    }

    // Handle specific error codes
    if (error.code === "CALL_EXCEPTION") {
      // For empty data response, it usually means wrong network or contract doesn't exist
      if (error.data === "0x" || error.data === null) {
        errorMessage = `Contract call failed. Please check:
          1. The contract exists at this address on the selected network
          2. The ABI matches the deployed contract
          3. You are connected to the correct network

          Method called: ${error.method || "unknown"}`;
      } else if (!errorMessage.includes("execution reverted")) {
        errorMessage = `Call failed: ${errorMessage}`;
      }
    } else if (error.code === "NETWORK_ERROR") {
      errorMessage =
        "Network error. Please check your connection and the selected network.";
    } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      // Check if there's a revert reason
      if (error.reason || (error.error && error.error.message)) {
        errorMessage = error.reason || error.error.message;
      } else {
        errorMessage = "Cannot estimate gas. The transaction may fail.";
      }

      // If it's a view function, suggest checking contract state
      if (functionType === "read") {
        errorMessage +=
          " This might indicate the contract is not properly initialized or the function requirements are not met.";
      }

      // Show error data if available
      if (error.error && error.error.data && error.error.data.data) {
        const errorData = error.error.data.data;
        errorMessage += ` (Error: ${errorData})`;

        // Try to decode common error signatures
        if (errorData === "0x3d6c2500") {
          errorMessage +=
            " - This error might indicate: insufficient mint fee, max supply reached, or metadata bank not set.";
          errorMessage +=
            " Check the contract's mintFee, totalMinted/maxSupply, and metadataBank values.";
        }
      }
    } else if (error.code === "ACTION_REJECTED") {
      errorMessage = "Transaction was rejected by the user.";
    }

    resultDiv.innerHTML = `<div class="bg-red-50 p-2 rounded text-red-600 text-sm">
      <div class="font-semibold">Error:</div>
      <div class="mt-1">${errorMessage}</div>
    </div>`;

    console.error("Contract interaction error:", error);
  }
}

// Load events for interface contracts
async function loadInterfaceEvents() {
  if (!currentInterfaceContract) {
    showMessage("No contract loaded", "error");
    return;
  }

  try {
    const eventsList = document.getElementById("interfaceEventsList");
    eventsList.innerHTML = '<div class="text-gray-500">Loading events...</div>';

    // Get recent events (last 100 blocks)
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 100);

    const filter = {
      address: currentInterfaceContract.address,
      fromBlock: fromBlock,
      toBlock: currentBlock,
    };

    const logs = await provider.getLogs(filter);

    if (logs.length === 0) {
      eventsList.innerHTML =
        '<div class="text-gray-500">No recent events found</div>';
      return;
    }

    // Parse logs
    eventsList.innerHTML = "";
    for (const log of logs) {
      try {
        const parsedLog = currentInterfaceContract.interface.parseLog(log);
        const eventDiv = document.createElement("div");
        eventDiv.className = "border rounded p-3 mb-2";

        eventDiv.innerHTML = `
          <div class="font-semibold">${parsedLog.name}</div>
          <div class="text-sm text-gray-600">Block: ${log.blockNumber}</div>
          <div class="text-sm mt-1">${JSON.stringify(
            parsedLog.args,
            null,
            2
          )}</div>
        `;

        eventsList.appendChild(eventDiv);
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }
  } catch (error) {
    showMessage("Failed to load events: " + error.message, "error");
  }
}

// Make functions available globally for onclick handlers
window.copyAddress = copyAddress;
window.toggleStepArgs = toggleStepArgs;
window.updateStepArgs = updateStepArgs;
window.startFromStep = startFromStep;

// Function to show deployed contracts in Interface Interaction
function showDeployedContractsQuickAccess() {
  const quickAccessDiv = document.getElementById(
    "deployedContractsQuickAccess"
  );
  const contractsList = document.getElementById("deployedContractsList");

  if (!quickAccessDiv || !contractsList) return;

  // Combine deployedAddresses and window.deployedContracts
  const allDeployedContracts = { ...deployedAddresses };
  if (window.deployedContracts) {
    Object.assign(allDeployedContracts, window.deployedContracts);
  }

  if (Object.keys(allDeployedContracts).length > 0) {
    quickAccessDiv.classList.remove("hidden");
    contractsList.innerHTML = Object.entries(allDeployedContracts)
      .map(
        ([name, address]) => `
        <div class="flex justify-between items-center p-1 hover:bg-blue-100 rounded">
          <span class="font-mono font-semibold">${name}:</span>
          <div class="flex items-center gap-2">
            <span class="text-gray-600">${address.slice(
              0,
              6
            )}...${address.slice(-4)}</span>
            <button onclick="copyAddress('${address}')" class="text-blue-500 hover:text-blue-700" title="Copy address">📋</button>
            <button onclick="useAddressInInterface('${address}', '${name}')" class="text-green-500 hover:text-green-700" title="Use in interface">➡️</button>
          </div>
        </div>
      `
      )
      .join("");
  } else {
    quickAccessDiv.classList.add("hidden");
  }
}

// Function to use address in interface
function useAddressInInterface(address, contractName) {
  const addressInput = document.getElementById("interfaceContractAddress");
  const contractSelect = document.getElementById("interfaceContractSelect");

  if (addressInput) {
    addressInput.value = address;
  }

  if (contractSelect && contractName) {
    // Try to find and select the matching contract
    const options = Array.from(contractSelect.options);
    const matchingOption = options.find((option) => {
      // Check if the option value or text contains the contract name
      return (
        option.value.includes(contractName) ||
        option.text.includes(contractName)
      );
    });

    if (matchingOption) {
      contractSelect.value = matchingOption.value;
      showMessage(`Selected ${contractName} and copied address`, "success");
    } else {
      // If no exact match, try to find a suitable interface
      const interfaceOption = options.find((option) => {
        // Common patterns for interface selection
        if (contractName.includes("NFT") && option.text.includes("NFT"))
          return true;
        if (contractName.includes("Token") && option.text.includes("Token"))
          return true;
        if (contractName.includes("Bank") && option.text.includes("Bank"))
          return true;
        return false;
      });

      if (interfaceOption) {
        contractSelect.value = interfaceOption.value;
        showMessage(
          `Selected ${interfaceOption.text} interface for ${contractName}`,
          "info"
        );
      } else {
        showMessage(
          "Address copied. Please select the appropriate interface manually.",
          "info"
        );
      }
    }
  } else {
    showMessage("Address copied to input field", "success");
  }
}

window.showDeployedContractsQuickAccess = showDeployedContractsQuickAccess;
window.useAddressInInterface = useAddressInInterface;
window.saveDeployedAddressIncremental = saveDeployedAddressIncremental;
