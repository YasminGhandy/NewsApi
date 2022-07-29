const News = require('../models/news')
const express = require('express')
const auth = require('../middelware/auth')
const router = express.Router()
const multer = require('multer')

const uploads = multer({
    limits:{
        fieldSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpng|png|jfif)$/)){
            return cb(new Error('Please Upload Image'))
        }
        cb(undefined,true)
    }
})

//// post new news

router.post('/news',auth,async(req,res)=>{
    try{
        const news = await News({...req.body,owner:req.reporter._id})
        await news.save()
        if(!news){
            res.status(404).send('There is nothing to save')
        }
        res.status(200).send(news)
    }catch(e){
        res.status(500).send(e.message)
    }
})

/////post Image to specific news using id 

router.post('/newsImage/:id',auth,uploads.single('image'),async(req,res)=>{
    try{    
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        news.image = req.file.buffer
        await news.save()
        if(!news){
            res.status(404).send("Can't find news")
        }
        res.status(200).send(news)
    }catch(e){
        res.status(500).send(e.message)
    }

})

///////get news by populate

router.get('/news',auth,async(req,res)=>{
    try{
        await req.reporter.populate('news')
        res.status(200).send(req.reporter.news)
    }catch(e){
        res.status(500).send(e.message)
    }
})

//////get news by id

router.get('/news/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            res.status(404).send('Unable to find news')
        }
        res.status(200).send(news)
    }catch(e){
        res.status(500).send(e.message)
    }
})
/////// get owner of news by id 

router.get('/newsReporter/:id',auth,async(req,res)=>{
    try {
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            res.status(404).send('Unable to find news')
        }
        await news.populate('owner')
        res.status(200).send(news.owner)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

////// patch news by id
router.patch('/news/:id',auth,async(req,res)=>{
    try {

        const updates = Object.keys(req.body)
        const allowedUpdates = ['title','description']
        const isValid = updates.every((el)=>allowedUpdates.includes(el))
        if(!isValid){
            return res.status(400).send('Unable to update')
        }

        const _id =req.params.id
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            res.status(404).send('Unable to find news')
        }

        updates.forEach((el)=>{
            news[el]=req.body[el]
        })

        await news.save()
        res.status(200).send(news)
    } catch (e) {
        res.status(500).send(e.message)
    }
 })
 ///delete news by id
router.delete('/news/:id',auth,async(req,res)=>{
    try{   
        const _id =req.params.id
        const news = await News.findOneAndDelete({_id,owner:req.reporter._id})
        if(!news){
            res.status(404).send('Unable to find news')
        }
        res.status(200).send(news)
    }catch(e){
        res.status(500).send(e.message)
    }
})

module.exports = router 