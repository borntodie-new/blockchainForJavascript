## 仓库介绍
> 该仓库是使用hardhat框架实现的集资项目
## 技术介绍
### 1. hardhat-deploy插件的使用
> hardhat-deploy插件主要是使开发人员更快的部署开发项目
1. 安装
    ```shell
    yarn add --dev hardhat
    ```
2. 使用
    - 在项目根目录下新建`deploy`文件夹，在里面新建一个js脚本。注意：新建的js脚本的名字最好有顺序，建议以00、01、02...开头，当我们在执行deploy命令时，项目会按照00、01、02的顺序依次执行脚本
    - 将js脚本中的定义的函数向外导出。注意：这里向外导出需要使用`module.exports = xxx`，这和原生js的导包有点区别，一定要注意
    - 在js脚本的最后为当前文件定义些个标签`tags`。注意：当我们在执行deploy的时候，有些deploy文件我们是不想要执行的，但是呢，框架又是以00、01、02的顺序执行的，这就和我们预期的效果起冲突了。这时候我们定义的标签就派上用场了。我们可以在执行deploy的时候设置规则，只有tag符合的的deploy才会执行。
3. 执行
    - 执行全部的deploy：`yarn hardhat deploy`。后面可以跟着那个网络
    - 执行指定的deploy：`yarn hardhat deploy --tags 标签名`。后面可以跟着那个网络
4. 示例
    - 实例代码
        ```js
        // 00-deploy-mock.js
        const {
            developmentChains,
            DECIMALS,
            INITIAL_ANSWER,
        } = require("../helper-hardhat-config")

        module.exports = async ({ getUnnamedAccounts, deployments }) => {
            // getUnnamedAccounts, deployments 两个变量都是从hardhat中解压出来的，此时的hardhat就是hardhat的运行环境，简称hre
            // getUnnamedAccounts：是获取当前执行部署项目的钱包信息，注意：一定不要和getNamedAccounts函数弄混了，在课程中，老师使用的就是getNamedAccounts，但是会报错
            // deployments：是一些合约在执行过程中的信息
            const { deploy, log, getNetworkName } = deployments
            // deploy是用来部署项目的函数
            // log使用来向控制台输出日志信息
            // getNetworkName是用来获取当前网络的名字的，返回值就是我们在命令行执行 --network 后面接着的名字，也可以使用network.name获取[network是hardhat中的属性]
            const deployer = await getUnnamedAccounts()
            const networkName = await getNetworkName()
            if (developmentChains.includes(networkName)) {
                console.log("Local network detected! Deploying mocks...")
                await deploy("MockV3Aggregator", { // 这个非常重要，后面通过ethers.getContract()获取合约对象就是通过这个名字的。
                    contract: "MockV3Aggregator", // 合约名字，一定要正确
                    from: deployer[0], // 谁来部署合约
                    args: [DECIMALS, INITIAL_ANSWER], // 合约构造函数需要的参数
                    log: true,// 是否开启日志功能
                })
                log("Mocks deployed!")
                log("--------------------------------")
            }
        }

        module.exports.tags = ["all", "mocks"] // 为当前的deploy设置tags标签
        ```
        ```js
        // 01-deploy-fund-me.js
        const { networkConfig, developmentChains } = require("../helper-hardhat-config")
        const { network } = require("hardhat")
        const { verify } = require("../utils/verify")

        module.exports = async ({ getUnnamedAccounts, deployments, getChainId }) => {
            const { deploy, log, getNetworkName } = deployments

            const deployer = await getUnnamedAccounts()
            const chainId = await getChainId()
            const networkName = await getNetworkName()

            let ethUsdPriceFeedAddress
            if (developmentChains.includes(networkName)) {
                const mockV3Aggregator = await deployments.get("MockV3Aggregator") // 注意：这是在deploy中获取前面已经部署好了的合约的对象，其实也可以通过ethers.getContract("contractName", "contractDeployer")获取。但是第一种方式只能在deploy文件中使用
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
                blockConfirmations: network.config.blockConfirmations || 1, // 交易等待多少个区块确认
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
        module.exports.tags = ["all", "fundme"] // 为该deploy打上标签
        ```
    - 执行
        ```shell
        yarn hardhat deploy --tags mocks # 单独执行标签为mocks的deploy，后面也可以加上网络
        yarn hardhat deploy # 按照顺序执行全部的deploy
        ```
### 2. hardhat框架测试
#### 单元测试
- `describe`、`it`、`beforeEach`的使用
    - describe：定义一个测试集，其中`describe.skip`，跳过执行
        ```js
        describe(testName, function)
        ```
    - it：测试集中的测试用例：后期测试的时候可以根据第一个参数设置规则单独执行某个测试用例
        ```js
        it(testDescription, function)
        ```
    - beforeEach：写在describe中，执行测试用例前一定会执行的操作
        ```js
        beforeEach(function)
        ```
    - **describe中还可以在写describe**
- 示例
    ```js
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
            const sendValue = ethers.utils.parseEther("1") // 快捷转换ETH
            beforeEach(async () => {
                const deployers = await getUnnamedAccounts()
                deployer = deployers[0]
                await deployments.fixture(["all"]) // 这个是执行所有标签符合all的deploy，其中当我们已经部署好了合约，其实这行代码可以不写，这里的部署了的意思是，在我们项目的根目录中有一个deploys文件夹，里面的又有一些文件夹，如果我们在执行 --network 后面带的网络名字在deploys文件夹中出现，这种情况就可以不写这行
                fundMe = await ethers.getContract("FundMe", deployer) // 注意，我们在前面的deploy中说过，ethers.getContract函数第一个参数就是在ethers.deploy()函数中的第一参数，但是这里不能使用deployments.get(contractName)来获取合约对象
                mockV3Aggregator = await ethers.getContract( "MockV3Aggregator", deployer)
            })

            describe("constructor", async () => {
                it("sets th aggregator addresses correctly", async function () {
                    const response = await fundMe.getPriceFeed()
                    assert.equal(response, mockV3Aggregator.address)
                })
            })

            describe("fund", async () => {
                it("Failed if you don't send enough ETH", async () => {
                    await expect(fundMe.fund()).to.be.revertedWith( // 这是捕获异常，表示该操作一定报错，并且报错信息是You need to spend more ETH!
                        "You need to spend more ETH!"
                    )
                })
                it("updated the amount funded data srtucture", async () => {
                    await fundMe.fund({ value: sendValue, from: deployer })
                    const response = await fundMe.getAddressToAmountFunded(deployer)
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
                    const startingFundMeBalance =await fundMe.provider.getBalance(fundMe.address) // 这是合约内容的钱，此时合约内已经有1ETH了，上面的beforeEach已经投钱了

                    const startingDeployerBalance =await fundMe.provider.getBalance(deployer) // 这是部署者的钱
                    // Act
                    const transactionResponse = await fundMe.cheaperWithdraw({from: deployer})

                    const transactionReceipt = await transactionResponse.wait(1)
                    const { gasUsed, effectiveGasPrice } = transactionReceipt // gasUsed表示合约花的gas费，effectiveGasPrice表示每个gas值多少钱
                    const gasCost = gasUsed.mul(effectiveGasPrice) // 这才是整个操作花的gasFee

                    // Assert
                    const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address) // 这是合约内容的钱，此时已经把合约中的钱取完了
                    const endingDeployerBalance = await fundMe.provider.getBalance(deployer) // 这是部署者的钱

                    assert.equal(endingFundMeBalance.toString(), "0")
                    assert.equal(
                        startingFundMeBalance.add(startingDeployerBalance).toString(),
                        endingDeployerBalance.add(gasCost).toString()
                    )
                })

                it("allows us to withdraw with mutiple funders", async () => {
                    const accounts = await ethers.getSigners()
                    // 多些用户为合约打钱
                    for (let i = 1; i < 6; i++) {
                        const funderMeConnectContract = await fundMe.connect(
                            accounts[i] // 注意，这里不是传用户钱包的地址，而是SignerWithAddress对象，fundMe.connect是指一个新用户接入这个合约，我们在上面一直是使用fundMe来做操作，并没有告诉合约是谁在操作，这是因为上面的操作默认都是合约的部署者在操作，但我们想要一个新的用户在操作合约，就需要使用fundMe.connect(address)来操作
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

                    const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                    const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                    // 断言
                    // 1. 所有捐过钱的用户，账号上都是0
                    for (let i = 1; i < 6; i++) {
                        assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),"0")
                    }
                    // 2. 清空所有捐过钱用户的信息
                    await expect(fundMe.getFunder(0)).be.to.reverted // 断言该操作一定会报错

                    // 3. 开始合约内有6ETH
                    assert.equal(startingFundMeBalance.toString(),(6 * sendValue).toString())

                    // 4. 取完钱后，合约没钱
                    assert.equal(endingFundMeBalance.toString(), "0")

                    // 5. 取完钱后，合约部署者多了6ETH
                    assert.equal(startingDeployerBalance.add(startingFundMeBalance).toString(),
                        endingDeployerBalance.add(gasCost).toString()
                    )
                })

                it("only allows the owner to withdraw", async () => {
                    const accounts = await ethers.getSigners()
                    const fakeAccount = accounts[1]
                    const attackerConnectContract = await fundMe.connect(fakeAccount)
                    await expect(attackerConnectContract.cheaperWithdraw()).to.be.reverted
                })
            })
        })
    ```
- 执行
    ```shell
    yarn hardhat test --grep "describeInfo" # 执行测试用例描述符合describeInfo的测试用例，后面可以设置网络
    yarn hardhat test # 执行全部的测试用例
    ```
#### 集成测试
```js
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

              const endingBalance = await fundMe.provider.getBalance(fundMe.address) // 根据账户地址获取该账户在本合约中的存款
              assert.equal(endingBalance.toString(), "0")
          })
      })
```
### 3. 执行脚本
> 执行脚本全部都是放在根目录的scripts文件夹中
- 示例1
```js
/*
打钱
*/

const { ethers, getUnnamedAccounts } = require("hardhat")

const main = async () => {
    console.log("deploying...")
    const deployer = await getUnnamedAccounts()[0]
    const fundMe = await ethers.getContract("FundMe", deployer) // 注意，网络名必须在deploys文件夹中
    console.log("deployed...")

    console.log("funding...")
    await fundMe.fund({ value: ethers.utils.parseEther("0.1") })
    console.log("funded...")
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })

```
- 执行1
```shell
yarn hardhat run scripts/fund.js --network rinkeby
```
- 示例2
```js
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

```
- 执行2
```shell
yarn hardhat run scripts/withdraw.js --network rinkeby
```
## 注意事项
1. 合约节省gas费：https://github.com/crytic/evm-opcodes
2. 合约书写规范：https://docs.soliditylang.org/en/v0.8.17/style-guide.html
3. 设置快速执行命令
    - 在package.json中添加`scripts`
    ```json
    {
        "devDependencies": {
            ...
        },
        "dependencies": { 
            ...
        },
        "scripts":{
            "test": "yarn hardhat test"
            ...
        }
    }
    ```
