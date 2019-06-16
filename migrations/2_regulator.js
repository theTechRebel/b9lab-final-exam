const Regulator = artifacts.require("Regulator");
const TollBoothOperator = artifacts.require("TollBoothOperator");


module.exports = async function(deployer) {
    deployer.deploy(Regulator).then(()=>{
        return deployer.deploy(TollBoothOperator,false,100,Regulator.address);
    }).then(async()=>{
        var regulator = await Regulator.deployed();
        await regulator.createNewOperator(TollBoothOperator.address,100);
    })
};