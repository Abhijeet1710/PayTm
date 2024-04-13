const { Router } = require('express')
const { mongoose, startSession } = require("mongoose")

const { walletCreditBody } = require("../../zod-validations/index.js")
const { UserCollection } = require("../../db/db.js");

const router = Router()

router.post("/wallet/credit", async (req, res) => {
    console.log("Wallet");
    const { success, error } = walletCreditBody.safeParse(req.body)

    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs",
            errors: error.issues.map((er) => `${er.path} : ${er.message}`)
        })
    }

    const fromUserPhone = req.body.phoneNumber
    const amountToCredit = Number(req.body.amount)
    const provider = req.body.provider

    const session = await startSession()

    try {
        session.startTransaction()
        const userDetails = await UserCollection.findOne({
            phoneNumber: fromUserPhone
        })
         
        if (!userDetails) {
            await session.endSession()

            return res.status(404).json({
                message: `User with phone number : ${fromUserPhone} not exists`
            })
        }
        
        // User Logged in As req.userId And trying to credit to different phoneNumber of different user
        // req.userId is the _id field of Logged in User (by token)

        if (userDetails._id != req.userId) {
            await session.endSession()

            return res.status(404).json({
                message: `Invalid Operation`
            })
        }

        const bankToken = generateRandomString(10)
        const walletCreditObj = getwalletCreditObject(null, bankToken, amountToCredit, provider)

        // increase amount of phoneNumber provided
        // Add this transaction in wallet of this provided phoneNumber user
        const updateWalletTrans = await UserCollection.updateOne(
            { phoneNumber: fromUserPhone }, // Filter for documents where the phone field equals 123
            {
                $push: {
                    walletTransactions: walletCreditObj
                }
            } // Update to be applied (e.g., setting a new field)
        ).session(session)

        console.log("update wallet Details " + JSON.stringify(updateWalletTrans));

        if (updateWalletTrans) {
            await session.commitTransaction()
            await session.endSession()

            return res.json({
                message: "Transaction is in Pending status"
            })
        }

    } catch (err) {
        await session.abortTransaction()
        await session.endSession()

        console.log("Err : " + err);
    }

    res.status(500).json({ msg: "Internal Server Error" })
})

const getwalletCreditObject = (status, bankToken, amount, provider) => {
    return {
        status: (!status) ? "Pending" : status,
        bankToken,
        amount,
        provider
    }
}

const generateRandomString = (length) => [...Array(length)].map(() => Math.random().toString(36)[2]).join('');

module.exports = router