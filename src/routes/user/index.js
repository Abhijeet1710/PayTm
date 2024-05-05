const { Router } = require("express");
const bcrypt = require("bcrypt");

const { UserCollection } = require("../../db/db.js");
const { updateUserDetailsBody } = require("../../zod-validations/index.js");

const router = Router();

router.get("/user-details/:userName", async (req, res) => {
  const userName = req.params.userName;

  try {
    const userDetails = await UserCollection.findOne({
      $or: [{ email: userName }, { userName: userName }],
    });

    // User Logged in As req.userId And trying to get user-details of different user
    // req.userId is the _id field of Logged in User (by token)

    if (userDetails._id != req.userId) {
      return res.status(404).json({
        message: `Invalid Operation`,
      });
    }

    if (userDetails) {
      return res.json({
        message: "Success",
        userDetails: { ...userDetails._doc, password: null },
      });
    } else {
      return res.status(404).json({
        message: `User ${userName} not found`,
      });
    }
  } catch (err) {}

  res.status(500).json({ msg: "Internal Server Error" });
});

router.put("/user-details/:userName", async (req, res) => {
  const { success, error } = updateUserDetailsBody.safeParse(req.body);
  const userName = req.params.userName;

  if (!success) {
    return res.status(411).json({
      message: "Invalid inputs",
      errors: error.issues.map((er) => `${er.path} : ${er.message}`),
    });
  }

  const existingUser = await UserCollection.findOne({
    $or: [{ email: userName }, { userName }],
  });

  if (!existingUser) {
    return res.status(404).json({
      message: "Email/userName not found",
    });
  }

  // User Logged in As req.userId And trying to transfer from different phoneNumber of different user
  // req.userId is the _id field of Logged in User (by token)

  if (existingUser._id != req.userId) {
    return res.status(404).json({
      message: `Invalid Operation`,
    });
  }

  const firstName = req.body.firstName
    ? req.body.firstName
    : existingUser.firstName;
  const lastName = req.body.lastName
    ? req.body.lastName
    : existingUser.lastName;
  const address = req.body.address ? req.body.address : existingUser.address;
  const phoneNumber = req.body.phoneNumber
    ? req.body.phoneNumber
    : existingUser.phoneNumber;
  const password = req.body.password
    ? await bcrypt.hash(req.body.password, 10)
    : existingUser.password;

  try {
    const user = await UserCollection.updateOne(
      {
        $or: [{ email: userName }, { userName }],
      },
      {
        $set: {
          password,
          firstName,
          lastName,
          phoneNumber,
          address,
        },
      }
    );

    console.log("Update " + JSON.stringify(user));

    return res.json({
      message: "Updated successfully",
    });
  } catch (err) {
    console.log(JSON.stringify(err));
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.get("/isloggedin", async (req, res) => {
  res.status(200).json({
    userId: `${req.userId}`,
    message: `User Is Logged In`,
  });
});

module.exports = router;
