const mongoose = require('mongoose')

const newsSchema = mongoose.Schema({
    description:{
        type:String,
        trim:true,
        required:true,
        minLength:10
    },
    title:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    image:{
        type:Buffer
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Reporter'
    }
})

newsSchema.methods.toJSON= function(){
    const news = this
    const newsObject = news.toObject()
    return newsObject
}
const News = mongoose.model('News',newsSchema)
module.exports = News