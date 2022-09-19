## 仓库介绍
> 本仓库和`hardhat-fund-me-fcc`是一起的。`hardhat-fund-me-fcc`是链端，本仓库是前端。二者一起构成一个完成的项目
## 技术介绍
### 1. 静态文件启动服务
> 在我们开发纯html项目时，是不能直接通过启动服务的方式打开文件，这对我们开发很不方便
1. 使用`live-server`插件[vscode插件]
    - 直接在vscode插件市场搜索安装即可
    - 使用：在命令行执行`live-server`即可
    - 设置服务信息：在项目根目录下新建`.vscode`文件夹并在里面编写如下代码
        ```json
        // settings.json
        {
            "liveServer.settings.port": 8080,
            "liveServer.settings.CustomBrowser": "chrome"
        }
        ```
2. 使用`http-server`插件[第三方包]
    - 安装：`yarn add --dev http-server`
    - 启动：`yarn http-server`
    - 帮助：`yarn http-server --help`
3. `<script src="" type=""></script>`标签导入
    - 当type的值是`text/javascript`的时候，导入的js文件中不能使用`import`语法
    - 当type的值是`module`的时候，导入的js文件中可以使用`import`语法
### 2. 纯`ethers`的使用
1. 三个“兄弟”
    -  `Provider`：是一个为以太坊网络连接提供抽象的类型。他提供对区块链及其状态的**只读访问**。他是获取当前metamask的账户信息及其以太坊网络的一些只读信息
    - `Signer`：签名者是一个（通常）以某种方式直接或间接访问私钥的类，他可以签署消息和交易授权网络向账户收取token，执行操作
    - `Contract`：合约的一种抽象类，表示与以太坊网络上特定合约的连接，因此应用程序可以像使用普通javascript对象一样使用他
2. 示例
```js
async function fund() {
    let ethAmount = document.getElementById("ethAmount").value
    if (ethAmount >= 0.1) {
    } else {
        alert("ethAmount not less than 0.1")
        return
    }
    console.log(`Funding with ${ethAmount}`)

    if (typeof window.ethereum !== "undefined") { // 判断是否安装了metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum) // 获取当前小狐狸的账户和当前使用的网络信息，都是些可读的信息
        const signer = provider.getSigner() // 获取当前的账户
        const contract = new ethers.Contract(contractAddress, abi, signer) // 通过合约的已经部署的地址，合约的abi信息，部署者的信息实例化一个合约对象，通过这个合约对象可以操作合约，可读可写的操作
        try {
            const transactionResponse = await contract.fund({value: ethers.utils.parseEther(ethAmount)}) // 执行合约中的函数
            // 等待上述操作完成
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
            await balance()
        } catch (e) {
            console.log(e)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    // transactionResponse合约的执行返回结果
    // provider区块链信息
    console.log(`Mining ${transactionResponse.hash}...`)
    // 监听交易完成
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => { // 监听第一个参数的交易是否完成，第二个参数是回调函数
            console.log(
                `Conpleted with ${transactionReciept.confirmations} confirmations.`
            )
            resolve()
        })
    })
}

```
## 注意事项
1. `ethers`的地址：https://docs.ethers.io/v5/
2. 对合约进行写操作一定要加上监听执行结果操作
3. js文件导包注意事项
4. 如果在使用metamask网络的时候，报出："nonce值过高"的错误，我们重启本地的链，再到metmask上reset accounts就好
5. 在使用metamask网络时，要记得在合约中补全`fallback`和`receive`两个函数。不然会报错，可能是metamask会自己来访问合约信息导致的报错