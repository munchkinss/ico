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
      it("approves tokens for transfers", function() {
          return DappToken.deployed().then(function(instance) {
              tokenInstance = instance;
              return tokenInstance.approve.call(accounts[1], 100, { from: accounts[0] })
          }).then(function(success) {
              assert.equal(success, true, "returns true")
              return tokenInstance.approve(accounts[1], 100, { from: accounts[0] })
          }).then(function(receipt) {
              assert.equal(receipt.logs.length, 1, 'triggers one event');
              assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approve" event');
              assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are owned');
              assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens approved to');
              assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
              return tokenInstance.allowance(accounts[0], accounts[1])
          }).then(function(allowance) {
              assert(allowance.toNumber() <= 100, "only " + allowance.toNumber() + " is allowed to spend")
          })
      })
      it("handles the delegated token transfer", function() {
          return DappToken.deployed().then(function(instance) {
              tokenInstance = instance;
              fromAccount = accounts[2];
              toAccount = accounts[3];
              spendingAccount = accounts[4];
              return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] })
          }).then(function(receipt) {
              return tokenInstance.approve(spendingAccount, 20, { from: fromAccount })
          }).then(function(receipt) {
              return tokenInstance.transferFrom(fromAccount, toAccount, 999999999, { from: spendingAccount })

          }).then(assert.fail).catch(function(error) {
              assert(error.message.indexOf('revert') >= 0, 'cannot transfer value ');
              return tokenInstance.transferFrom(fromAccount, toAccount, 30, { from: spendingAccount })
          }).then(assert.fail).catch(function(error) {
              assert(error.message.indexOf('revert') >= 0, 'cannot transfer larger than approved amount ');
              return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount })
          }).then(function(success) {
              assert.equal(success, true, "Transer cant be happen")
              return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount })
          }).then(function(receipt) {
              assert.equal(receipt.logs.length, 1, 'triggers one event');
              assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
              assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
              assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
              assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount')
              return tokenInstance.balanceOf(fromAccount);
          }).then(function(balance) {
              assert.equal(balance.toNumber(), 90, 'balance of account sending money')
              return tokenInstance.balanceOf(toAccount);

          }).then(function(balance) {
              assert.equal(balance.toNumber(), 10, 'balance of account recieving money')

              return tokenInstance.allowance(fromAccount, spendingAccount)
          }).then(function(allow) {
              assert.equal(allow, 10, "no more than that")
          })
      })
  })