  var DappToken = artifacts.require("./DappToken.sol");
  contract(DappToken, function(accounts) {
      var tokenInstance;
      it("sets the correcr values of contract", function() {
          return DappToken.deployed().then(function(instance) {
              tokenInstance = instance;
              return tokenInstance.name();
          }).then(function(name) {
              assert.equal(name, 'DappToken', "Correct Name")
              return tokenInstance.symbol()
          }).then(function(symbol) {
              assert.equal(symbol, 'DAPP', 'Correct Symbol')
              return tokenInstance.standard()
          }).then(function(standard) {
              assert.equal(standard, 'DAPP v1', 'Correct Standard')
          })
      })
      it("sets the totalSupply upon deployment", function() {
          return DappToken.deployed().then(function(instance) {
              tokenInstance = instance;
              return tokenInstance.totalSupply();
          }).then(function(totalSupply) {
              assert.equal(totalSupply.toNumber(), 1000000, "sets the totalSupply to 1000000")
              return tokenInstance.balanceOf(accounts[0]);
          }).then(function(adminBalance) {

              assert.equal(adminBalance.toNumber(), 1000000, "allocates the initial Supply to admin Account")
          });
      })
      it("transfers token ownership", function() {
          return DappToken.deployed().then(function(instance) {
              tokenInstance = instance;
              return tokenInstance.transfer.call(accounts[1], 9999999999999999999);
          }).then(assert.fail).catch(function(error) {
              assert(error.message.indexOf('revert') == -1, 'error message contains revert');
              return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] })
          }).then(function(success) {
              assert(success, true, 'returns success')
              return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] })
          }).then(function(receipt) {
              assert.equal(receipt.logs.length, 1, 'triggers one event');
              assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
              assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
              assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
              assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');

              return tokenInstance.balanceOf(accounts[1]);
          }).then(function(balance) {

              assert.equal(balance.toNumber(), 250000, "adds the account");
              return tokenInstance.balanceOf(accounts[0])
          }).then(function(balance) {
              assert.equal(balance.toNumber(), 750000, 'deducts the amount from sender')
          })
      })
  })