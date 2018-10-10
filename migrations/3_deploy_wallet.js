var MegaWallet = artifacts.require("MegaWallet");

module.exports = function(deployer) {
  deployer.deploy(MegaWallet);
};