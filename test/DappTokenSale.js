var DappTokenSale = artifacts.require("./DappTokenSale.sol")
var DappToken = artifacts.require("./DappToken.sol")

contract('DappTokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var admin = accounts[0];
    var tokenPrice = 1000000000000000; //wei
    var tokensAvailable = 750000
    var buyer = accounts[1]
    var numberofTokens
    it("initializes the contract with correct values", function() {
        return DappTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address) {
            assert.notEqual(address, 0x0, "contact address")
            return tokenSaleInstance.tokenContract()
        }).then(function(address) {
            assert.notEqual(address, 0x0, "has token contract address")
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {

            assert.equal(price, tokenPrice, "price is not equal")
        })
    })
    it("facilitates token buying", function() {
        return DappToken.deployed().then(function(instance) {
            //tokenInstance first
            tokenInstance = instance;

            return DappTokenSale.deployed()
        }).then(function(instance) {
            tokenSaleInstance = instance;

            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
        }).then(function(receipt) {
            numberofTokens = 10
            return tokenSaleInstance.buyTokens(numberofTokens, { from: buyer, value: numberofTokens * tokenPrice })
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._amount, numberofTokens, 'logs the transfer amount');

            return tokenSaleInstance.tokenSold();
        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberofTokens, "tokens sold")
            return tokenInstance.balanceOf(buyer)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberofTokens, "Available balance")
            return tokenInstance.balanceOf(tokenSaleInstance.address)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable - numberofTokens, "Available balance")
            return tokenSaleInstance.buyTokens(numberofTokens, { from: buyer, value: 1 })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= -0, 'value too less to buy');

            return tokenSaleInstance.buyTokens(8000000, { from: buyer, value: numberofTokens * tokenPrice })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') == -1, error.message.indexOf('revert'));
        })
    })
    it("Ends Token Sale", function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance
            return DappTokenSale.deployed()
        }).then(function(instance) {
            tokenSaleInstance = instance
            return tokenSaleInstance.endSale({ from: buyer })
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, error.message.indexOf('revert'));
            return tokenSaleInstance.endSale({ from: admin })
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 1000000, 'returns all unsold dapp tokens to admin');
            // Check that the contract has no balance
            return tokenInstance.balanceOf(tokenInstance.address)
        }).then(function(balance) {
            assert.equal(balance, 0);
        })
    })
})