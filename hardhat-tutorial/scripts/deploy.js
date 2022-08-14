const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {METADATA_URL} = require("../constants");

async function main() {
  // URL from where we can extract the metadata for a Crypto Dev NFT
  const metadataURL = METADATA_URL;

/*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so cryptoDevsContract here is a factory for instances of our CryptoDevs contract.
  */
  const citaContract = await ethers.getContractFactory("cita");

  // deploy the contract
  const deployedcitaContract = await citaContract.deploy(
    metadataURL,
  
  );
  // print the address of the deployed contract
  console.log(
    "cita Contract Address:",
    deployedcitaContract.address
  );
}
// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
