// import
// main function
// calling of main function
// async function deployFunc(hre) {
//     console.log(hre)
//     console.log("Hi!")
// }

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({
    getUnnamedAccounts,
    deployments,
    getChainId,
    ethers,
}) => {
    const { deploy, log, getNetworkName } = deployments

    const deployer = await getUnnamedAccounts()
    const chainId = await getChainId()
    const networkName = await getNetworkName()

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(networkName)) {
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        // const mockV3Aggregator = await ethers.getContract(
        //     "MockV3Aggregator",
        //     deploy[0]
        // )
        ethUsdPriceFeedAddress = mockV3Aggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    log("Deploying FundMe....")
    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer[0], // 合约的部署者
        args: [ethUsdPriceFeedAddress], // 合约构造函数的参数
        log: true, // 是否输出日志信息
        blockConfirmations: network.config.blockConfirmations || 1,
    })
    log("Deployed FundMe....")
    log("--------------------------------")

    // Verify Contract
    if (
        !developmentChains.includes(networkName) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // await verify(fundMe.address, [ethUsdPriceFeedAddress])
        log("verify success")
    }
}
module.exports.tags = ["all", "fundme"]
