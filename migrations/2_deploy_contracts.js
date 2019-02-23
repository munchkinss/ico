var DappToken = artifacts.require("./DappToken.sol");
var DappTokenSale = artifacts.require("./DappTokenSale.sol")
var dappToken;
var tokenPrice = 1000000000000000;
module.exports = function(deployer) {
    deployer.deploy(DappToken, 1000000).then(function() {

        return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice)
    });

};