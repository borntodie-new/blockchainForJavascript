require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config() // 加载配置文件
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
/** @type import('hardhat/config').HardhatUserConfig */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
        ganache: {
            url: "http://127.0.0.1:7545",
            accounts: [
                "0c0c2f60af3f5bf638359ba9645e39b361f0ac345a1af929c37760e23eb7d3b0",
            ],
            chainId: 1337,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            // accounts: []
            chainId: 31337,
        },
    },
    gasReporter: {
        enabled: false,
        noColor: true,
        // outputFile: "gas-reporter.txt",
        currency: "USD",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}
