const { Router } = require('express')
const { UserCollection } = require("../../db/db.js");
const { webhookBody } = require("../../zod-validations/index.js")


const router = Router()

const validateBankAuth = async () => {
    return true
}

router.post("/hdfcWebhook", async (req, res) => {
    console.log("webhook " + JSON.stringify(req.body));

    const isAuthenticBankRequest = await validateBankAuth()

    if(!isAuthenticBankRequest) {
        return res.status(403).json({})
    }

    const { success, error } = webhookBody.safeParse(req.body)

    if(!success) {
        return res.status(411).json({
            message: "Invalid inputs",
            errors: error.issues.map((er) => `${er.path} : ${er.message}`)
        })
    }

    const userId = req.body.userId
    const bankToken = req.body.token
    const amountToCredit = req.body.amount
    
    try {
        const userDetails = await UserCollection.findOne( { _id: userId })
         
        if (!userDetails) {
            return res.status(404).json({
                message: `User not exists`
            })
        }

        const isAlreadyCaptured = isAlreadyCapturedTrans(userDetails, bankToken)

        if(isAlreadyCaptured) {
            return res.json({msg: "Was Already Captured"})
        }

        // reduce amount of from
        // Add this transaction in p2pTransactions of from
        const creditAmt = await UserCollection.updateOne(
            { _id: userId, "walletTransactions.bankToken": bankToken }, // Filter for documents where the phone field equals 123
            {
                $set: {
                    amount: Number(userDetails.amount + amountToCredit),
                    "walletTransactions.$.status": "Successful"
                }
            } // Update to be applied (e.g., setting a new field)
        );

        console.log("creditAmt " + JSON.stringify(creditAmt));
        res.json({msg: "Captured"})
        
    }catch(err) {
        console.log("Err : "+err);
    }

    res.status(500).json({msg: "Internal Server Error"})
})

const isAlreadyCapturedTrans = (userDetails, token) => {
    const walletTransObject = userDetails.walletTransactions.filter((wTr) => wTr.token == token)
    return walletTransObject.length > 0 && walletTransObject[0].status == "Successful"
}

module.exports = router