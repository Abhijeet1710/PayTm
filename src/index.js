require('dotenv').config()
const express = require('express')
const healthRouter = require("./routes/health/index.js")
const userAuthRouter = require("./routes/user-auth/index.js")
const userRouter = require("./routes/user/index.js")
const p2pRouter = require("./routes/p2p/index.js")
const walletRouter = require("./routes/wallet/index.js")
const webhookRouter = require("./routes/webhook/index.js")
const cors = require('cors')
const { authMiddleware } = require('./auth-middleware/middleware.js')

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api", webhookRouter)

app.use("/api/v1", healthRouter)
app.use("/api/v1", userAuthRouter)

app.use(authMiddleware)

app.use("/api/v1", userRouter)

app.use("/api/v1", p2pRouter)

app.use("/api/v1", walletRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server up and Running on https://localhost:${process.env.PORT}`);
})