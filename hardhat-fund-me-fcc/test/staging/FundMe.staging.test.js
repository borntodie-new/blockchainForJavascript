/*
1. 该测试是测试真实网络
2. 全部都是集成测试
*/

const { assert } = require("chai")
const {
    developments,
    getUnnamedAccounts,
    network,
    ethers,
    deployments,
} = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          let sendValue = ethers.utils.parseEther("0.1") // 1ETH
          beforeEach(async () => {
              const deployers = await getUnnamedAccounts()
              deployer = deployers[0]
              //   await deployments.fixture("all")
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async () => {
              // 存钱
              await fundMe.fund({ value: sendValue, from: deployer })
              // 取钱
              await fundMe.withdraw({ from: deployer })

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
