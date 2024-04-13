const { Router } = require('express')
const { UserCollection } = require("../../db/db.js");
const { signinBody, signupBody } = require("../../zod-validations/index.js")
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require("../../config.js");

const router = Router()

router.post("/signup", async (req, res) => {
    const { success, error } = signupBody.safeParse(req.body)

    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs",
            errors: error.issues.map((er) => `${er.path} : ${er.message}`)
        })
    }

    const existingUser = await UserCollection.findOne({
        $or: [{email: req.body.email}, {userName: req.body.userName}]
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email/userName already taken"
        })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    try {
        const user = await UserCollection.create({
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            amount: 0,
            walletTransactions: [],
            p2pTransactions: []
        })

        const userId = user._id;

        const token = jwt.sign({
            userId
        }, JWT_SECRET);

        return res.json({
            message: "Account created successfully",
            token: token
        })
    } catch (err) {
        console.log(JSON.stringify(err));
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }

})

router.post("/signin", async (req, res) => {
    const { success, error } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs",
            errors: error.issues.map((er) => `${er.path} : ${er.message}`)
        })
    }

    const user = await UserCollection.findOne({
        email: req.body.email
    });

    if (user) {

        const reqBodyPassword = req.body.password
        const dbHashedPassword = user.password

        const isPasswordCorrect = await bcrypt.compare(reqBodyPassword, dbHashedPassword)

        if (isPasswordCorrect) {
            const token = jwt.sign({
                userId: user._id
            }, JWT_SECRET);

            return res.json({
                token
            });
        }
    }

    res.status(411).json({
        message: "User not found, Create a account first"
    })
})

module.exports = router