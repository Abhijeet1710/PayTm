const { Router } = require('express')
const { UserCollection } = require("../../db/db.js");
const { signinBody, signupBody, isValidUserName } = require("../../zod-validations/index.js")
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require("../../config.js");
const { setHeaders } = require('../../utils.js');

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
            errors: ["Email already taken"]
        })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    try {
        const user = await UserCollection.create({
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
            fullName: req.body.fullName,
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
            errors: ["Internal Server Error"]
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
        $or: [{email: req.body.userName}, {userName: req.body.userName}]
    });

    if (user) {

        const reqBodyPassword = req.body.password
        const dbHashedPassword = user.password

        const isPasswordCorrect = await bcrypt.compare(reqBodyPassword, dbHashedPassword)

        if (isPasswordCorrect) {
            const token = jwt.sign({
                userId: user._id
            }, JWT_SECRET);

            delete user.password

            return res.status(200).json({
                message: "Login Successful!",
                access_token: token,
                user
            });
        } else {
            return res.status(411).json({
                errors: ["Incorrect password"]
            });
        }
    }

    res.status(404).json({
        errors: ["User not found, Create a account first"]
    })
})


router.get("/usernameAvailability/:userName", async (req, res) => {

    const { success, error } = isValidUserName.safeParse(req.params?.userName)
    if (!success) {
        return res.status(400).json({
            message: "Invalid inputs",
            errors: error.issues.map((er) => `userName : ${er.message}`)
        })
    }
    
    const user = await UserCollection.findOne({
        userName: req.params.userName
    });

    if (user) {
        return res.status(400).json({
            errors: ["userName already taken, Pls choose different userName"]
        })
    }

    
    res.status(200).json({
        message: "Perfect !"
    })
})


module.exports = router