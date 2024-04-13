require('dotenv').config()
const express = require('express')
const healthRouter = require("./routes/health/index.js")
const userRouter = require("./routes/user/index.js")
const cors = require('cors')

console.log("Mongo Url : " + process.env.MONGO_URL)

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/v1", healthRouter)
app.use("/api/v1", userRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server up and Running on https://localhost:${process.env.PORT}`);
})