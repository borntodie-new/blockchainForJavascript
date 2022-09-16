## 仓库介绍
1. 该仓库是我的第一个通过JavaScript实现智能合约的仓库
2. 完全是手动实现合约的编译、部署、执行、调用合约
## 实现过程
1. 首先编写合约的内容
2. 下载安装`ethers`包
> 可以将ethers理解为一个编写合约的开发环境
```
安装：
yarn add ethers
```
3. 安装编译合约插件：`solc`
```shell
安装：
yarn add solc@版本号
如果不加上版本号，yarn会自动根据合约中申明的solidity版本进行安装

yarn add solc@0.8.7

使用：
solcjs --help 查询solcjs的使用命令

  -V, --version                        solcjs的版本
  --version                            solcjs的版本
  --optimize                           开启合约的编译优化，默认是关闭的
  --bin                                要求输出合约的二进制的文件，以十六进制的格式输出
  --abi                                要求输出合约的abi文件
  --standard-json                      输出的文件是否是json格式
  --base-path <path>                   需要编译的合约的位置
  -o, --output-dir <output-directory>  输出编译后文件的位置
  -h, --help                           获取命令的使用手册

记住：
yarn solcjs --abi --bin --base-path . SimpleStorage.sol --include-path ./node_modules -o .
翻译：将当前文件夹位置中的SimpleStorage.sol文件编译成abi文件和bin文件，并且输出到当前文件夹中。
```
## 编码过程
1. 新建一个js文件，文件内容模板如下：
```js
async function main() {
    // 主要是编写部署、调用合约的内容
}

main().then(()=>{
    process.exit(1) // 执行成功main函数，安全退出
}, (error)=>{
    console.log(error) // 执行失败main函数，失败退出
    process.exit(1)
})
```
2. 编写main函数中的内容
```js
import ethers from "ethers"
import fs from "fs-extra"

async function main() {
    // 1. 获取节点信息
    const provider = new ethers.Providers.JsonRpcBatchProvider("http://127.0.0.1:7545")

    // 2. 获取需要部署合约的abi信息
    const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")

    // 3. 获取需要部署合约的bin信息
    const bin = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf8")

    // 4. 获取需要部署合约的钱包信息：需要将钱包的私钥和provider进行绑定
    const wallet = new ethers.Wallet("0x123kl14e1m", provider)

    // 5. 获取合约工厂对象：将合约的abi、bin、wallet进行绑定
    const contractFactory = new ethers.ContractFactory(abi, bin, wallet)

    // 6. 部署合约：主要，此处需要等合约部署完成，部署之后的返回的对象就是合约对象
    const contract = await contractFactory.deploy()

    // 7. 输出部署之后合约对象的信息
    const deploymentReciept = await contract.deployTransaction.wait(1)
    console.log(deploymentReciept)
}
```
3. 执行合约函数
```js
async function main(){
    // ... 此处省略合约的部署代码，具体参考上面的代码
    const contract = await contractFactory.deploy()

    // 获取合约中的favoriteNumber状态
    const favoriteNumber = await contract.retrieve()
    console.log(favoriteNumber) // 此处打印出来的值并不是0（合约中uint256类型的零值默认是0），而是BigNum的类型，为什么？这和js的特性有关，在js中，当一个int类型的值超过了其最大值的范围时，js会将其设置成bigNum类型，这是js的一种保护机制。那我们想要看到这个值怎么办，这是就需要为其加上toString()方法了。
    console.log(favoriteNumber.toString()) // 0

    // 修改合约的favoriteNumber的状态
    const transactionResponse = await contract.store(7) // 合约中store方法接收的参数是一个uint256，但是在js中，数字类型的字符串和数字类型区别不大，所以这里既可以传"7"，也可以传7
    
    // 查看合约中favoriteNumber的状态是否修改
    const _favoriteNumber = await contract.retrieve()
    console.log(_favoriteNumber.toString()) // 7
}
```
## 使用到的包
1. ethers：通过js月ether进行交互的包
```shell
# 安装
yarn add ethers
# 使用
在js文件中导入即可使用
```
2. fs-extra：操作本地文件
```shell
# 安装
yarn add fs-extra
# 使用【读取文件】
const fs = require("fs-extra")
fs.readFileSync("文件地址", "编码格式")
cosnt abi = fs.readFileSync("./content.abi", "utf8")
```
3. solc：编译合约文件
```shell
# 安装
yarn add solc@版本号
# 使用
yarn solcjs --help
```
4. dotenv：读取本地环境变量信息
```shell
# 安装
yarn add dotenv
# 使用
require("dotenv").config() # 将dotenv加载到js的process对象中
process.env.PRIVATE_KEY
```
## 信息加密处理
在本示例代码中，我们的私钥等不可泄露信息是硬编码在`.env`文
中。使用测试网和ganache本地区块节点时，私钥泄露没有任何问题，但是在正式上线部署到主网上，这是非常致命的，那么我们该如何处理呢？
1. 我们预先将私钥信息加密得到一个json信息，此时需要提供的私钥信息还是需要提供的，提供好之后就可以删除私钥信息了。
2. 部署的时候我们通过加密后的json信息进行解密得到`wallet`对象
3. 将得到的`wallet`对象与测试网进行绑定
```js
// 加密私钥信息
const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
    // 读取私钥实例化一个wallet对象
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    // 对实例化好的wallet对象进行加密操作
    const encryptedJsonKey = await wallet.encrypt(
        process.env.PRIVATE_KEY_PASWORD,
        process.env.PRIVATE_KEY
    );
    // 得到加密后的json信息
    console.log(encryptedJsonKey);
    // 将加密后的json信息存入本地文件
    fs.writeFileSync("./.encryptedKey.json", encryptedJsonKey);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
```
```js
// 解密私钥信息并获取一个wallet对象
const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
    // 获取网络节点信息
    const provider = new ethers.providers.JsonRpcBatchProvider(
        process.env.RPC_URL
    );
    // 读取加密json信息
    const encryptedKey = fs.readFileSync("./.encryptedKey.json", "utf8");
    // 通过加密信息实例化出来一个wallet对象
    let wallet = new ethers.Wallet.fromEncryptedJsonSync(
        encryptedKey,
        process.env.PRIVATE_KEY_PASSWORD
    );
    // 将wallet对象与网络节点进行绑定
    wallet = await wallet.connect(provider);
}
```
