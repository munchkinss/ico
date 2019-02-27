App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokenAvailable: 750000,
    tokenSold: 0,
    init: function() {
        return App.initweb3()
    },
    initweb3: function() {
        if (typeof web3 !== 'undefined') {

            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)


        } else {

            App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545")
            web3 = new Web3(App.web3Provider)
        }

        return App.initContracts()
    },
    initContracts: function() {
        $.getJSON("DappTokenSale.json", function(dapptokensale) {
            App.contracts.DappTokenSale = TruffleContract(dapptokensale)
            App.contracts.DappTokenSale.setProvider(App.web3Provider);
            App.contracts.DappTokenSale.deployed().then(function(dappTokenSale) {

            })
        }).done(function() {
            $.getJSON("DappToken.json", function(dapptoken) {
                App.contracts.DappToken = TruffleContract(dapptoken)
                App.contracts.DappToken.setProvider(App.web3Provider);
                App.contracts.DappToken.deployed().then(function(dappToken) {
                    console.log(dappToken.address)
                })
            })
            App.listenForEvents();
            return App.render()
        })

    },
    listenForEvents: function() {
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',

            }).watch(function(error, event) {
                App.render()
            })
        })
    },
    render: function() {
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $("#content");
        //load Account data
        loader.show()
        content.hide()
        web3.eth
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account:" + account);
            }

        })

        App.contracts.DappTokenSale.deployed().then(function(instance) {
            tokensaleInstance = instance;
            return tokensaleInstance.tokenPrice();
        }).then(function(price) {
            console.log(price)
            App.tokenPrice = price;
            $(".token-price").html(web3.fromWei(App.tokenPrice, 'ether').toNumber());
            return tokensaleInstance.tokenSold();
        }).then(function(tokenSold) {
            App.tokenSold = tokenSold
            $(".token-sold").html(App.tokenSold.toNumber())
            $(".tokens-available").html(App.tokenAvailable)
            var progressPercent = Math.ceil(App.tokenSold * 100 / App.tokenAvailable)
            console.log(progressPercent)
            $("#progress").css('width', progressPercent + '%');

            App.contracts.DappToken.deployed().then(function(instance) {
                tokenInstance = instance;
                return tokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.dapp-balance').html(balance.toNumber())
                App.loading = false;
                loader.hide()
                content.show()
            })
        })

    },
    buyTokens: function() {
        var loader = $('#loader');
        var content = $("#content");
        //load Account data
        loader.show()
        content.hide()
        var numberOfToken = $('#numberOfTokens').val()
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfToken, {
                from: App.account,
                value: numberOfToken * App.tokenPrice,
                gas: 500000
            });
        }).then(function(result) {
            console.log(result)
            $("form").trigger('reset')

        })

    }

}
$(document).ready(function() {


    App.init()

})