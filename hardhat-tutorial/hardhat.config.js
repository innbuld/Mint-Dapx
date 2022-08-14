require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const ANKR_ID = process.env.ANKR_ID;

const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: ANKR_ID,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },
};