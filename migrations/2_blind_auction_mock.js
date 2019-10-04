var BlindAuction = artifacts.require("./BlindAuction.sol");

module.exports = function(deployer) {
  deployer.deploy(
    BlindAuction,
    1570319999,
    1570419999,
    "0x0cf10F3A684c9A4E080F34289995ff9cB3b352E0"
  );
};
