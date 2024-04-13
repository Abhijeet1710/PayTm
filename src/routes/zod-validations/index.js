const zod = require("zod");


const signinBody = zod.object({
    email: zod.string().email(),
	password: zod.string().min(6)
})

const signupBody = zod.object({
    userName: zod.string().min(3).max(15),
    email: zod.string().email(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string().min(6).max(16),
    phoneNumber: zod.string().regex(new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/), 'Invalid Phone Number!')
})

module.exports = {
    signinBody,
    signupBody
}