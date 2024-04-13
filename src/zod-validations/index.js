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

const p2pTransferBody = zod.object({
    toUserPhone: zod.string(),
	fromUserPhone: zod.string(),
    amount: zod.number().min(1000)
})


const walletCreditBody = zod.object({
    phoneNumber: zod.string().regex(new RegExp(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/), 'Invalid Phone Number!'),
    provider: zod.string(),
    amount: zod.number().min(1000)
})

module.exports = {
    signinBody,
    signupBody,
    p2pTransferBody,
    walletCreditBody
}