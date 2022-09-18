/*
1. 该测试是测试本地网络
2. 全部都是单元测试
*/

const { assert, expect } = require("chai")
const { deployments, getUnnamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") // 1eth
          beforeEach(async () => {
              const deployers = await getUnnamedAccounts()
              deployer = deployers[0]
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async () => {
              it("sets th aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async () => {
              it("Failed if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amount funded data srtucture", async () => {
                  await fundMe.fund({ value: sendValue, from: deployer })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue, from: deployer })
                  const funder = await fundMe.getFunder(0)
                  // console.log(funder)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue, from: deployer })
              })

              it("withdraw ETH from a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address) // 这是合约内容的钱，此时合约内已经有1ETH了，上面的beforeEach已经投钱了
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer) // 这是部署者的钱
                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw({
                      from: deployer,
                  })

                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  ) // 这是合约内容的钱，此时已经把合约中的钱取完了
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer) // 这是部署者的钱

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with mutiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  // 多些用户为合约打钱
                  for (let i = 1; i < 6; i++) {
                      const funderMeConnectContract = await fundMe.connect(
                          accounts[i] // 注意，这里不是传用户钱包的地址，而是SignerWithAddress对象
                      )
                      await funderMeConnectContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // 开始取钱了
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // 断言
                  // 1. 所有捐过钱的用户，账号上都是0
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          "0"
                      )
                  }
                  // 2. 清空所有捐过钱用户的信息
                  await expect(fundMe.getFunder(0)).be.to.reverted

                  // 3. 开始合约内有6ETH
                  assert.equal(
                      startingFundMeBalance.toString(),
                      (6 * sendValue).toString()
                  )

                  // 4. 取完钱后，合约没钱
                  assert.equal(endingFundMeBalance.toString(), "0")

                  // 5. 取完钱后，合约部署者多了6ETH
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fakeAccount = accounts[1]
                  const attackerConnectContract = await fundMe.connect(
                      fakeAccount
                  )
                  await expect(attackerConnectContract.cheaperWithdraw()).to.be
                      .reverted
              })
          })
      })
