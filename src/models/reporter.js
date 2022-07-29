const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')

const reporterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 25,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive number')
            }
        }
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minLength: 6,
        validate(value) {
            let strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if (!strongPassword.test(value)) {
                throw new Error('Enter strong password')
            }
        }
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isMobilePhone(value, 'ar-EG')) {
                throw new Error('Phone number is invalid')
            }
        }
    },
    image:{
        type:Buffer
    },
    tokens: [{
        type: String,
        required: true
    }]
})

reporterSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'owner'
})


reporterSchema.pre('save', async function () {
    const reporter = this
    if (reporter.isModified('password'))
        reporter.password = await bcryptjs.hash(reporter.password, 8)
})

reporterSchema.methods.generateToken = async function () {
    const reporter = this
    const token = jwt.sign({_id: reporter._id.toString()}, process.env.JWT_SECRET)
    reporter.tokens = reporter.tokens.concat(token)
    await reporter.save()
    return token
}

reporterSchema.statics.findByCredentials = async (email, password) => {
    const reporter = await Reporter.findOne({email})
    if (!reporter) {
        throw new Error('Please check email or password')
    }

    const isMatch = await bcryptjs.compare(password, reporter.password)
    if (!isMatch) {
        throw new Error('Please check email or password')
    }
    return reporter
}

reporterSchema.methods.toJSON = function (){
    const reporter = this
    const reporterObject = reporter.toObject()
    return reporterObject
}

const Reporter = mongoose.model('Reporter', reporterSchema)

module.exports = Reporter