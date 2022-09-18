/*
取钱
*/

const { ethers, getUnnamedAccounts } = require("hardhat")

const main = async () => {
    console.log("deploying...")
    const deployer = await getUnnamedAccounts()[0]
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("deployed...")

    console.log("funding...")
    await fundMe.fund({ value: ethers.utils.parseEther("0.1") })
    console.log("funded...")
    console.log("withdrawing...")
    const transactionResponse = await fundMe.withdraw({ from: deployer })
    await transactionResponse.wait(1)
    console.log("withdrawed...")
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
