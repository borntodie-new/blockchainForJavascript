const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getUnnamedAccounts, deployments }) => {
    const { deploy, log, getNetworkName } = deployments
    const deployer = await getUnnamedAccounts()
    const networkName = await getNetworkName()
    if (developmentChains.includes(networkName)) {
        console.log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer[0],
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        log("Mocks deployed!")
        log("--------------------------------")
    }
}

// module.exports = async (hre) => {
//     const { getNamedAccounts, getUnnamedAccounts, deployments, getChainId } =
//         hre
//     const { deploy, log, getGasUsed, getNetworkName } = deployments
//     const deployer = await getNamedAccounts()
//     const unDeployer = await getUnnamedAccounts()
//     const chainId = await getChainId()
//     const gasUsed = await getGasUsed()
//     const networkName = await getNetworkName()
//     const aaa = await deployments.get("aaa")
//     console.log(hre)
//     console.log(log)
//     console.log(deployer)
//     console.log(unDeployer)
//     console.log(chainId)
//     console.log(gasUsed)
//     console.log(networkName)
//     console.log(aaa)
// }

module.exports.tags = ["all", "mocks"]
