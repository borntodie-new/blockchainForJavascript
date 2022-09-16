// 导入ethers包
import ethers from "ethers"
// 导入读取文件的包
import * as fs from "fs-extra"
// 导入dotenv包，用于读取配置文件数据
import "dotenv/config"
/*
dotenv的使用
  1. 导入dotenv包
  2. 读取配置：process.env.PRIVATE_KEY
*/

async function main() {
  // compile them in our code
  // compile them separately

  const provider = new ethers.providers.JsonRpcBatchProvider(
    process.env.RPC_URL
  )
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  // const encryptedKey = fs.readFileSync("./.encryptedKey.json", "utf8")
  // let wallet = new ethers.Wallet.fromEncryptedJsonSync(
  //   encryptedKey,
  //   process.env.PRIVATE_KEY_PASSWORD
  // )
  // wallet = await wallet.connect(provider)

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  )
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
  console.log("Deploying, please wait...")

  const contract = await contractFactory.deploy() // STOP here wait for contract to deployed
  await contract.deployTransaction.wait(1) // get contract deployed informations
  console.log(`Conrtact Address: ${contract.address}`)

  const favoriteNumber = await contract.retrieve()
  console.log(`Curent Favorite Number: ${favoriteNumber.toString()}`)

  const transactionResposne = await contract.store(7)
  const transactionReceipt = await transactionResposne.wait(1)

  const _favoriteNumber = await contract.retrieve()
  console.log(`Curent Favorite Number: ${_favoriteNumber.toString()}`)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
