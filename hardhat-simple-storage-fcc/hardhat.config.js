require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainID: 4,
        },
        ganache: {
            url: "http://127.0.0.1:7545",
            accounts: [
                "3939e97fd6f8e8f8c18e4c460f1cdcf9ccb125974eaec299d08c327e72c55d2e",
            ],
            chainID: 1337,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts: []
            chainID: 31337,
        },
    },
    solidity: "0.8.17",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false, // 开启gas花费统计
        // outputFile: "gas-reporter.txt", // 将gas统计结果输出到文件
        noColor: true, // 关闭颜色显示
        currency: "USD", // 以$为统计花费单位
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
}
