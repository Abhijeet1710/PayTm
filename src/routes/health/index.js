const { Router } = require('express')

const router = Router()

router.get("/healthCheck", (req, res) => {
    res.status(200).json({
        statusCode: 200,
        message: "Hey Sahil ! Server is Up And healthy... 🚀"
    })
})

module.exports = router