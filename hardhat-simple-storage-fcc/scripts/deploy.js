// 1. imports
const { ethers, run, network } = require("hardhat")
// 2. async main
async function main() {
    // 获取合约的工厂对象
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploying contract...")
    // 部署合约
    const simpleStorage = await SimpleStorageFactory.deploy()
    // 等待合约部署完成
    await simpleStorage.deployed()
    console.log(`Deployed contract to: ${simpleStorage.address}`)

    // 校验合约
    console.log("network config => ", network.config)
    console.log("ETHERSCAN_API_KEY => ", process.env.ETHERSCAN_API_KEY)
    if (network.config.chainID === 4 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...")
        await simpleStorage.deployTransaction.wait(6)
        await verify(simpleStorage.address, [])
    }

    // 获取合约中favoriteNumber状态
    const currrentValue = await simpleStorage.retrieve()
    console.log(`Current Value is: ${currrentValue}`)

    // 修改合约中favoriteNumber的状态
    const transactionResponse = await simpleStorage.store(8)
    await transactionResponse.wait(1)

    // 获取修改后的favoriteNumber的状态
    const updatedValue = await simpleStorage.retrieve()
    console.log(`Updated value is :${updatedValue}`)
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...")
    try {
        console.log("来了")
        console.log(contractAddress)
        console.log(args)
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log("又走了")
    } catch (e) {
        console.log("出错了")
        if (e.message.toLowerCase().includes("already verify")) {
            console.log("Already Verify!")
        } else {
            console.log(e)
        }
    }
}

// 3. call main
main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
