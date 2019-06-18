const Regulator = artifacts.require("Regulator");
module.exports = async function(deployer) {
    const accounts = await web3.eth.getAccounts();
    if(accounts.length == 0 ){
        throw new Error("No account with which to transact");
    }else{
        const regulatorcontract = await deployer.deploy(Regulator);
        const txobj = await regulatorcontract.createNewOperator(accounts[1],100);
        const logNewOperator = txobj.logs[0];
        if(logNewOperator.event == "LogTollBoothOperatorCreated"){
            const check = await regulatorcontract.isPaused.call();
            if(check){
                await regulatorcontract.setPaused(false,{from:accounts[0]});
            }
        }
        
    }
};