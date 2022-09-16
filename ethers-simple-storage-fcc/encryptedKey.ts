// 导入ethers包
import ethers from "ethers"
// 导入读取文件的包
import * as fs from "fs-extra"
// 导入dotenv包，用于读取配置文件数据
import "dotenv/config"


async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

  const encryptedJsonKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASWORD,
    process.env.PRIVATE_KEY
  );
  console.log(encryptedJsonKey);

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
