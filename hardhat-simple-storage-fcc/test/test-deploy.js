const { ethers } = require("hardhat")
const { assert, expect } = require("chai")

describe("SimpleStorage", function () {
    let simpleStorageFactory, simpleStorage
    // beforeEach可以理解为初始化工作
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await simpleStorageFactory.deploy()
    })
    // 写测试用例
    it("Should start with a favorite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve()
        const expectValue = "0"
        assert.equal(currentValue.toString(), expectValue) // 断言第一个参数和第二个参数的值是相等的
        // expect(currentValue.toString()).to.equal(expectValue)
    })
    // it.only("Should update when we call store", async function(){ // 只执行该测试用例
    it("Should update when we call store", async function () {
        const expectValue = "19"
        const transactionResponse = await simpleStorage.store(19)
        await transactionResponse.wait(1)

        const currentValue = await simpleStorage.retrieve()

        assert.equal(currentValue.toString(), expectValue)
    })
})
