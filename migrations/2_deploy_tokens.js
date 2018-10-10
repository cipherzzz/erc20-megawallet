var GenericERC20 = artifacts.require("GenericERC20");

module.exports = function(deployer) {
  deployer.deploy(GenericERC20, "MegaCoin", "MEGA", 18);
};