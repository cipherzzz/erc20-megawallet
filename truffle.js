
require('dotenv').config()
const HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC = process.env.MNEMONIC

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "http://localhost:8545")
      },
      network_id: "*", // Match any network id
    }
  }
};
