// Import the page's CSS. Webpack will know what to do with it.
import "../styles/app.css";

const Web3 = require("web3");
const Promise = require("bluebird");
const truffle = require("truffle-contract");
const $ = require("jquery");
const RegulatorJson = require("../../build/contracts/Regulator.json");
const TollBoothOperatorJson = require("../../build/contracts/TollBoothOperator.json");


const Regulator = truffle(RegulatorJson);
const TollBoothOperator = truffle(TollBoothOperatorJson);

   var accounts;
    var account;

   window.App = {
    start: function() {
      var self = this;
      Regulator.setProvider(web3.currentProvider);
      TollBoothOperator.setProvider(web3.currentProvider);
      console.log("app loaded");
  
      // Get the initial account balance so it can be displayed.
      web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          alert("There was an error fetching your accounts.");
          return;
        }
  
        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }
  
        accounts = accs;
        account = accounts[0];
        console.log(accounts);

        self.bindEvents();
        self.refreshBalance();
        self.getVehicleBalance();
      });
    },
  
    setStatus: function(message) {
      var status = document.getElementById("status");
      status.innerHTML = message;
    },
  
    refreshBalance: function() {
      var regulator;
      Regulator.deployed().then(function(instance) {
      regulator = instance;
      // Query eth for balance
      web3.eth.getBalance(instance.address, function(err, balance) {
        if (err) {
            console.error(err);
        } else {
            console.log("regulator balance " + balance);
        }
      });
    })
    },
    getVehicleBalance: function(){
      var reg;
        Regulator.deployed().then(function(instance) {
          reg = instance;
        // Query eth for balance
        return reg.getVehicleType.call(account,{from: account});
      }).then(function(vtype) {
        console.log(vtype);
        var status = document.getElementById("vehicleBal");
        if(vtype == 0){
          status.innerHTML = "You are not a registered vehicle, we have nothing to display.";
        }else{
          web3.eth.getBalance(account, function(err, balance) {
            if (err) {
                console.log(err);
                "Could not check vehicle address balance at this moment, check logs";
            } else {
              console.log(balance);
              status.innerHTML ="Vehicle balance " + balance;
            }
          });
        }
      }).catch(function(e) {
        console.log(e);
        var status = document.getElementById("vehicleBal");
        status.innerHTML = "Could not check vehicle type at this moment, check logs";
      });
    },
    bindEvents: async function() {
     $(document).on('click', '#opbtn', App.handleNewOperator);
     $(document).on('click','#vetypebtn', App.handleVehicleType);
     $(document).on('click','#tolbtn', App.handleAddTollBooth);
     $(document).on('click','#tolroute', App.handleSetBasPrice);
     $(document).on('click','#genhash', App.handleGenHash);
     $(document).on('click','#entdep', App.handleEnterBooth);
     $(document).on('click','#extHashbtn', App.handleGetExitHistory);
     $(document).on('click','#exitsecretbtn', App.handleReportExit);
     $(document).on('click','#setmultiplier', App.handleReportExit);
  },
  
  handleNewOperator: function() {
      var deposit = document.getElementById("opbal").value;
      var owner = document.getElementById("opadd").value;
  
      App.setStatus("Initiating transaction... (please wait)");
  
      var reg;
      Regulator.deployed().then(function(instance) {
        reg = instance;
        return reg.createNewOperator(owner, deposit, {from: account});
      }).then(function() {
        App.setStatus("Transaction complete!");
        App.refreshBalance();
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to create owner; see log.");
      });
    },
    handleVehicleType: function() {
      var add = document.getElementById("veadd").value;
      var typ = document.getElementById("vetype").value;
  
      App.setStatus("Initiating transaction... (please wait)");
  
      var reg;
      Regulator.deployed().then(function(instance) {
        reg = instance;
        return reg.setVehicleType(add, typ, {from: account});
      }).then(function() {
        App.setStatus("Transaction complete!");
        App.refreshBalance();
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to create vehicle type; see log.");
      });
    },
    handleSetMultiplier: function() {
      var type = parseInt(document.getElementById("vtype").value);
      var multiplier = parseInt(document.getElementById("vmult").value);
  
      App.setStatus("Initiating transaction... (please wait)");
  
      var reg;
      Regulator.deployed().then(function(instance) {
        reg = instance;
        return reg.setMultiplier(type, multiplier, {from: account});
      }).then(function() {
        App.setStatus("Transaction complete!");
        App.refreshBalance();
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to set multiplier, see log.");
      });
    },
    handleAddTollBooth: function() {
      var add = document.getElementById("toladd").value;
  
      App.setStatus("Initiating transaction... (please wait)");
  
      var reg;
      TollBoothOperator.deployed().then(function(instance) {
        reg = instance;
        return reg.addTollBooth(add, {from: account});
      }).then(function() {
        App.setStatus("Transaction complete!");
        App.refreshBalance();
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to add toll booth see log.");
      });
    },

    handleSetBasPrice: function() {
      var add1 = parseInt(document.getElementById("toladd1").value);
      var add2 = parseInt(document.getElementById("toladd2").value);
      var price = parseInt(document.getElementById("tolPrice").value);
  
      App.setStatus("Initiating transaction... (please wait)");
  
      var reg;
      TollBoothOperator.deployed().then(function(instance) {
        reg = instance;
        return reg.setRoutePrice(add1,add2,price, {from: account});
      }).then(function() {
        App.setStatus("Transaction complete!");
        App.refreshBalance();
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to add routye price see log.");
      });
    },
    handleGenHash: function(){
      var secret = parseInt(document.getElementById("secret").value);
      App.setStatus("Generating crazy your unique hash... (please wait)");
  
      var reg;
      TollBoothOperator.deployed().then(function(instance) {
        reg = instance;
        return window.web3.fromAscii(secret);
      }).then(function(converted) {
        reg.hashSecret(converted, function(err, hash) {
          if (err) {
              console.log(err);
              "Could not generate hash at this moment, check logs";
          } else {
            console.log(hash);
            status.innerHTML =hash;
          }
        });
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to create hash see log.");
      });
    },
    handleEnterBooth: function(){
      var amount = parseInt(document.getElementById("entAmt").value);
      var secret = document.getElementById("entSecret").value;
      var booth = document.getElementById("entBooth").value;
      
      App.setStatus("Initiating transaction... (please wait)");
        TollBoothOperator.deployed().then(contract=>{
          contract.enterRoad.call(booth,secret,{from:account,value:amount}).then(success=>{
            console.log(success);
            contract.enterRoad(booth,secret,{from:window.account})
            .on('transactionHash', (hash) => {
             App.setStatus("Your transaction with Hash"+hash+" is on its way!")
          })
          .on('confirmation', (confirmationNumber, receipt) => {
            App.setStatus("Your transaction has been confirmed with: "+confirmationNumber);
            console.log(receipt);
          })
          .on('receipt', (receipt) => {
            if(receipt.status == 1){
              App.setStatus("Transaction was succesful");
            }else{
              App.setStatus("Transaction has failed");
            }
              console.log(receipt);
              App.getVehicleBalance();
          },error=>{
            App.setStatus("Transaction failed due to: "+error);
          })
        })
      });
  },
    handleGetExitHistory: function(){
      var exithash = document.getElementById("extHash").value;
        var reg;
        TollBoothOperator.deployed().then(function(instance) {
            reg = instance;
          // Query eth for balance
          return reg.getVehicleEntry.call(exithash,{from: account});
        }).then(function(obj) {
          console.log(obj);
          var status = document.getElementById("entryhistory");
          status.innerHTML = "Entry Booth: "+obj[0]+"<br/>";
          status.innerHTML += "Exit Booth: "+obj[1]+"<br/>";
          status.innerHTML += "Fee: "+obj[2];
        
        }).catch(function(e) {
          console.log(e);
          var status = document.getElementById("entryhistory");
          status.innerHTML = "Could not check entry history at this moment, check logs";
        });
    },
    handleReportExit: function(){
      var secret = document.getElementById("exitsecret").value;
      App.setStatus("Generating crazy your unique hash... (please wait)");
      var reg;
      TollBoothOperator.deployed().then(function(instance) {
        reg = instance;
        return reg.reportExitRoad(secret, {from: account});
      }).then(function() {
        App.setStatus("Transaction complete!");
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to report exit see log.");
      });
    }
}
  
  window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
  
    App.start();
  });
  