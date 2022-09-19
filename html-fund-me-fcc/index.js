// import ether

import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = balance
withdrawButton.onclick = withdraw

// connect fund
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
            connectButton.innerHTML = "Connected"
        } catch (e) {
            console.log(e)
        }
    } else {
        document
            .getElementById("connectButton")
            .innerHTML("no Metamask, please install ")
    }
}

// fund function

async function fund() {
    let ethAmount = document.getElementById("ethAmount").value
    if (ethAmount >= 0.1) {
    } else {
        alert("ethAmount not less than 0.1")
        return
    }
    console.log(`Funding with ${ethAmount}`)

    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // singer / wallet / someone with some gas
        // contract that we are interaction with ABI and addresses
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // 等待操作完成
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
            await balance()
        } catch (e) {
            console.log(e)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // 监听交易完成
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => {
            console.log(
                `Conpleted with ${transactionReciept.confirmations} confirmations.`
            )
            resolve()
        })
    })
}

// getBalance function
async function balance() {
    console.log("get Balance...")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const bal = await provider.getBalance(contractAddress)
            document.getElementById("balanceInput").value = bal
        } catch (e) {
            console.log(e)
        }
    }
}

// withdraw function
async function withdraw() {
    console.log("withdraw...")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Withdraw Done!")
            await balance()
        } catch (e) {
            console.log(e)
        }
    }
}
