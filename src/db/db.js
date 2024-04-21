require('dotenv').config()
const { mongoose } = require("mongoose")

mongoose.connect(`${process.env.MONGO_URL}&dbName=${process.env.ENV}`)


const walletSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        trim: true
    },
    bankToken: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    provider: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })

const userTransfer = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 15
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        maxLength: 10
    }
})

const p2pTransfers = new mongoose.Schema({
    fromUser: {
        type: userTransfer
    },
    toUser: {
        type: userTransfer
    },
    amount: {
        type: Number,
        required: true
    }
}, { timestamps: true })


// Create a Schema for Users
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 15
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 150
    },
    address: {
        type: String,
        trim: true,
        maxLength: 150
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        maxLength: 13
    },
    amount: {
        type: Number,
        required: true
    },
    walletTransactions: {
        type: [walletSchema],
        required: false
    } ,
    p2pTransactions: {
        type: [p2pTransfers],
        required: false
    } 
}, { timestamps: true });

// Create a model from the schema
const UserCollection = mongoose.model('User', userSchema);

module.exports = {
    UserCollection
}