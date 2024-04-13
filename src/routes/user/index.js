const { Router } = require('express')
const { UserCollection } = require("../../db/db.js");
const {signinBody, signupBody} = require("../zod-validations/index.js")
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config.js");

const router = Router()

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body)
    if (!success) {
        console.log("Validation Failed : "+success);
        return res.status(411).json({
            message: "Invalid inputs"
        })
    }

    const existingUser = await UserCollection.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await UserCollection.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "UserCollection created successfully",
        token: token
    })
})

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs"
        })
    }

    const user = await UserCollection.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })

        return;
    }

    res.status(411).json({
        message: "Error while logging in"
    })
})

module.exports = router