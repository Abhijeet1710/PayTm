const { Router } = require('express')
const { UserCollection } = require("../../db/db.js");

const router = Router()

router.get("/profile", async (req, res) => {
    res.json({msg: "This is your Profile Data"})
})


module.exports = router