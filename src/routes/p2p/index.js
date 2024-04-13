const { Router } = require('express')
const { p2pTransferBody } = require("../../zod-validations/index.js")
const { UserCollection } = require("../../db/db.js");

const router = Router()

router.post("/p2p/transfer", async (req, res) => {
    const { success, error } = p2pTransferBody.safeParse(req.body)

    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs",
            errors: error.issues.map((er) => `${er.path} : ${er.message}`)
        })
    }

    const fromUserPhone = req.body.fromUserPhone
    const toUserPhone = req.body.toUserPhone
    const amountToTransfer = Number(req.body.amount)

    try {
        const fromUserDetails = await UserCollection.findOne({
            phoneNumber: fromUserPhone
        })
        console.log("From " + JSON.stringify(fromUserDetails));
         
        if (!fromUserDetails) {
            return res.status(404).json({
                message: `User with phone number : ${fromUserPhone} not exists`
            })
        }
        
        // User Logged in As req.userId And trying to transfer from different phoneNumber of different user
        // req.userId is the _id field of Logged in User (by token)

        if (fromUserDetails._id != req.userId) {
            return res.status(404).json({
                message: `Invalid Operation`
            })
        }

        if (fromUserDetails.amount < amountToTransfer) {
            return res.status(404).json({
                message: `Insufficient balance`
            })
        }

        const toUserDetails = await UserCollection.findOne({
            phoneNumber: toUserPhone
        })
        console.log("To " + JSON.stringify(toUserDetails));
        if (!toUserDetails) {
            return res.status(404).json({
                message: `User with phone number : ${toUserPhone} not exists`
            })
        }

        const p2pTransferObj = getP2pTransferObject(fromUserDetails, toUserDetails, amountToTransfer)

        // reduce amount of from
        // Add this transaction in p2pTransactions of from
        const updateP2pFromDetails = await UserCollection.updateOne(
            { phoneNumber: fromUserPhone }, // Filter for documents where the phone field equals 123
            {
                $set: {
                    amount: Number(fromUserDetails.amount - amountToTransfer)
                },
                $push: {
                    p2pTransactions: p2pTransferObj
                }
            } // Update to be applied (e.g., setting a new field)
        );

        console.log("From updateP2pFromDetails " + JSON.stringify(updateP2pFromDetails));

        // increase amount of to
        // Add this transaction in p2pTransactions of to
        const updateP2pToDetails = await UserCollection.updateOne(
            { phoneNumber: toUserPhone }, // Filter for documents where the phone field equals 123
            {
                $set: {
                    amount: Number(toUserDetails.amount + amountToTransfer)
                },
                $push: {
                    p2pTransactions: p2pTransferObj
                }
            } // Update to be applied (e.g., setting a new field)
        );

        console.log("From updateP2pToDetails " + JSON.stringify(updateP2pToDetails));

        if (updateP2pToDetails && updateP2pFromDetails) {
            return res.json({
                message: "Amount transfered successfully"
            })
        }

    } catch (err) {
        console.log("Err ; " + JSON.stringify(err));
    }

    res.status(500).json({ msg: "Internal Server Error" })
})

const getP2pTransferObject = (from, to, amount) => {
    return {
        fromUser: {
            userName: from.userName,
            email: from.email,
            phoneNumber: from.phoneNumber
        },
        toUser: {
            userName: to.userName,
            email: to.email,
            phoneNumber: to.phoneNumber
        },
        amount
    }
}


module.exports = router