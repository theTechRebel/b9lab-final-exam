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
    web3Provider: null,
    contracts: {},
    init: async function() {
      return await App.initWeb3();
    },
    initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      }
      window.web3 = new Web3(App.web3Provider);
          return App.start();
    },
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
        console.log(account);

        self.bindEvents();
        self.refreshBalance();
        self.getVehicleBalance();
      });
    },
  
    setStatus: function(message) {
      var status = document.getElementById("status");
      status.innerHTML = message;
    },
  
    refreshBalance: async function() {
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

    var regulator = await Regulator.deployed();
    let transferEvent = regulator.LogTollBoothOperatorCreated({}, {fromBlock: 0, toBlock: 'latest'});
    console.log(transferEvent);
    transferEvent.get((error, logs) => {
      // we have the logs, now print them
    if(logs.length < 1){
      $("#tb_operator1").html("There are no TollBoothOperators Deployed");
      $("#tb_select1").hide();
    }else{
     $("#tb_operator1").html("Select a TollBoothOperator contract to use from below:");
     $("#tb_select1").show();
     let dropdown1;
    logs.forEach(
      function(log){
        dropdown1 +='<option value="'+log.args.newOperator+'">'+log.args.newOperator+'</option>';   
      }
    );
    $("#tb_select1").html(dropdown1);
    }
      var operators = [];
    logs.forEach(
      function(log){
        //console.log(log.args.owner);
        //console.log(account);
        if(log.args.owner == account){
          operators.push(log.args.newOperator);
          console.log(log.args.newOperator);
        }
      }
    );
    console.log(operators);
    if(operators.length <1){
      $("#tb_operator").html("You do not have any TollBooths to operate");
      $("#tb_select").hide();
    }else{
      $("#tb_operator").html("Select a TollBoothOperator contract to use from below:");
      $("#tb_select").show();
      let dropdown;
      operators.forEach(
        function(operator){
          dropdown+='<option value="'+operator+'">'+operator+'</option>';
        }
      );
      $("#tb_select").html(dropdown);
    }
    });
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
     $(document).on('click','#setmultiplier', App.handleSetMultiplier);
  },
  
  handleNewOperator: async function() {
      var deposit = document.getElementById("opbal").value;
      var owner = document.getElementById("opadd").value;
      console.log(deposit);
      console.log(owner);
  
      App.setStatus("Initiating transaction... (please wait)");
      const instance = await Regulator.deployed();
      const success = await instance.createNewOperator.call(owner, deposit,{
        from: account
      });
      if(success){
        const gas = await instance.createNewOperator.estimateGas(owner, deposit,{from:account});
        console.log(gas);
        web3.eth.getBlock("latest", async function(error, block){
          if(!error){
          const result = await instance.createNewOperator(owner, deposit,{from:account,gas:block.gasLimit});
          console.log(result.receipt.status);
          if(result.receipt.status){
            App.setStatus("Transaction complete!");
            App.refreshBalance();
          }else{
            App.setStatus("Failed to create owner; see log.");
            console.log(result);
          }
        }else{
              console.error(error);
        }
       })
        
       
      }else{
        App.setStatus("Failed to create owner; see log.");
      }
      
      
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
    handleSetMultiplier: async function() {
      var type = parseInt(document.getElementById("vtype").value);
      var multiplier = parseInt(document.getElementById("vmult").value);
      let e = document.getElementById("tb_select");
      var tollBoothOpAddress = e.options[e.selectedIndex].value;
      App.setStatus("Initiating transaction... (please wait)");
  
      let operator = await TollBoothOperator.at(tollBoothOpAddress);
      let result = await operator.setMultiplier.call(type, multiplier, {from: account});
      console.log(result);
      var reg;
      let gas = await operator.setMultiplier.estimateGas(type, multiplier, {from: account});
      TollBoothOperator.at(tollBoothOpAddress).then(function(instance) {
        reg = instance;
        return reg.setMultiplier(type, multiplier, {from: account,gas:gas});
      }).then(function() {
        App.setStatus("Transaction complete!");
        App.refreshBalance();
      }).catch(function(e) {
        console.log(e);
        App.setStatus("Failed to set multiplier, see log.");
      });
    },
    handleAddTollBooth: async function() {
      var add = document.getElementById("toladd").value;
      let e = document.getElementById("tb_select");
      var tollBoothOpAddress = e.options[e.selectedIndex].value;

      console.log(tollBoothOpAddress);
      App.setStatus("Initiating transaction... (please wait)");
  
      var reg;

      let operator = await TollBoothOperator.at(tollBoothOpAddress);
      let result = await operator.addTollBooth.call(add,{from:account});
      console.log(result);
      if(result){
        let gas = await operator.addTollBooth.estimateGas(add,{from:account});
        console.log(gas);
        TollBoothOperator.at(tollBoothOpAddress).then(function(instance) {
          reg = instance;
          return reg.addTollBooth(add, {from: account,gas:gas});
        }).then(function() {
          App.setStatus("Transaction complete!");
          App.refreshBalance();
        }).catch(function(e) {
          console.log(e);
          App.setStatus("Failed to add toll booth see log.");
        });
      }

      
    },

    handleSetBasPrice: async function() {
      var add1 = document.getElementById("toladd1").value;
      var add2 = document.getElementById("toladd2").value;
      var price = parseInt(document.getElementById("tolPrice").value);
      console.log(add1)
      console.log(add2)
      console.log(price)
      let e = document.getElementById("tb_select");
      var tollBoothOpAddress = e.options[e.selectedIndex].value;
      console.log(tollBoothOpAddress);
      App.setStatus("Initiating transaction... (please wait)");
  
      var reg;

      let operator = await TollBoothOperator.at(tollBoothOpAddress);
      let result = await operator.setRoutePrice.call(add1,add2,price, {from: account});
      console.log(result);
      if(result){
        let gas = await operator.setRoutePrice.estimateGas(add1,add2,price, {from: account});
        console.log(gas);
        TollBoothOperator.at(tollBoothOpAddress).then(function(instance) {
          reg = instance;
          return reg.setRoutePrice(add1,add2,price, {from: account,gas:gas});
        }).then(function() {
          App.setStatus("Transaction complete!");
          App.refreshBalance();
        }).catch(function(e) {
          console.log(e);
          App.setStatus("Failed to add route price see log.");
        });
      }
    },
    handleGenHash: async function(){
      var secret = document.getElementById("secret").value;
      App.setStatus("Generating your unique hash, it will appear here (please wait)");
      let e = document.getElementById("tb_select1");
      var tollBoothOpAddress = e.options[e.selectedIndex].value;
      console.log(tollBoothOpAddress);
      let fromAscii = await window.web3.fromAscii(secret);
      console.log(fromAscii);
      let operator = await TollBoothOperator.at(tollBoothOpAddress);
      let result = await operator.hashSecret(fromAscii);
      console.log(result);
      App.setStatus(result);
    },
    handleEnterBooth: async function(){
      var amount = parseInt(document.getElementById("entAmt").value);
      var secret = document.getElementById("entSecret").value;
      var booth = document.getElementById("entBooth").value;
      let e = document.getElementById("tb_select1");
      var tollBoothOpAddress = e.options[e.selectedIndex].value;
      console.log("Amount "+amount);
      console.log("Secret "+secret);
      console.log("Booth "+booth);
      console.log("Tool Address "+tollBoothOpAddress);
      
      App.setStatus("Initiating transaction... (please wait)");
      let operator = await TollBoothOperator.at(tollBoothOpAddress);
      let result = await operator.enterRoad.call(booth,secret,{from:account,value:amount});
      console.log(result);
      if(result){
        let gas =  await operator.enterRoad.estimateGas(booth,secret,{from:account,value:amount});
        console.log(gas);
        console.log(result);
        console.log(amount);
        await operator.enterRoad.sendTransaction(booth,secret,{from:account,value:amount})
        .on("transactionHash",async (hash)=>{
          App.setStatus("Your transaction with Hash"+hash+" is on its way!");
        })
        .on("confirmation",async(confirmationNumber, receipt)=>{
          App.setStatus("Your transaction has been confirmed with: "+confirmationNumber);
            console.log(receipt);
        })
        .on("receipt",async(receipt)=>{
            if(receipt.status == 1){
              App.setStatus("Transaction was succesful");
              }else{
                App.setStatus("Transaction has failed");
              }
                console.log(receipt);
        })
        .on("error",async(error)=>{
          App.setStatus("Transaction failed due to: "+error);
        })
        .on("Error",async(error)=>{
          App.setStatus("Transaction failed due to: "+error);
        })
        App.getVehicleBalance();
    }else{
      App.setStatus("Kindly check data supplied and try again, call action failed");
    }
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
    /*
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3  !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }*/
    

    //window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  
    App.init();
  });
  