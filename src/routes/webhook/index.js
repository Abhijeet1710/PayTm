const { Router } = require('express')
const { UserCollection } = require("../../db/db.js");

const router = Router()

router.get("/webhook", async (req, res) => {
    const userName = req.params.userName
    
    try {
        const userDetails = await UserCollection.findOne({
            $or: [{email: userName}, {userName: userName}]
        })
        if(userDetails) {
            return res.json({
                message: "Success",
                userDetails
            })
        } else {
            return res.status(404).json({
                message: `User ${userName} not found`
            })
        }
        
    }catch(err) {
    }

    res.status(500).json({msg: "Internal Server Error"})
})


module.exports = router