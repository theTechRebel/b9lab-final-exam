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

App = {
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
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }
  web3 = new Web3(App.web3Provider);
      return App.initContract();
    },
  
    initContract: function() {

      Regulator.setProvider(App.web3Provider);
      TollBoothOperator.setProvider(App.web3Provider);
      console.log("app loaded");
      web3.eth.getAccounts().then(function(accounts){
        if(accounts.length == 0 ){
          alert("No contract available for user");
          throw new Error("No account with which to transact");
        }
        window.account = accounts[0];
        $("#currentAddress").html( window.account);
        console.log("Account:", window.account);
      });

      App.getContractBalance();
      return App.bindEvents();
    },
    bindEvents: async function() {
     // $(document).on('click', '#split', App.handleSplit);
     // $(document).on('click','#withdraw', App.handleWithdraw);
  },
  getContractBalance: async function(){
      var contract = await TollBoothOperator.deployed();
      console.log(contract);
      console.log(contract.address);
      var bal = await web3.eth.getBalance(contract.address);
      $("#balance").html(bal+" Wei");
    console.log(bal);
  }
};
  
  $(window).on('load', function() {
    App.init();
   });