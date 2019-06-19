const Regulator = artifacts.require("Regulator");
const TollBoothOperator = artifacts.require("TollBoothOperator");
module.exports = async function(deployer) {
        const accounts = await web3.eth.getAccounts();
        const regulatorcontract = await deployer.deploy(Regulator);
        const txobj = await regulatorcontract.createNewOperator(accounts[1],100);
        const logNewOperator = txobj.logs[1];
        if(logNewOperator.event == "LogTollBoothOperatorCreated"){
            const address = logNewOperator.args[1];
            const instane = await TollBoothOperator.at(address);
            const pause = await instane.isPaused();
            if(pause){
                const result=await instane.setPaused(false,{from:accounts[1]});
                console.log(result);
            }
        }else{
            console.log(txobj);
            throw new Error("No contract ws created");
        }
    }
