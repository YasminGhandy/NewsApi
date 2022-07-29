const Reporter = require("../models/reporter")
const express = require("express")
const auth = require("../middelware/auth")
const router = express.Router()
const multer = require('multer')

const uploads = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpng|png|jfif)$/)){
            return cb(new Error('Please upload image'))
        }
        cb(undefined,true)
    }
})

router.post('/signup',uploads.single('image'), async (req, res) => {
    try {
        const reporter = await Reporter(req.body)
        reporter.image = req.file.buffer
        const token = await reporter.generateToken()
        // console.log(token)
        await reporter.save()
        res.status(200).send({reporter,token})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/login', async (req, res) => {
    try {
        const reporter = await Reporter.findByCredentials(req.body.email, req.body.password)
        const token = await reporter.generateToken()
        res.status(200).send({
            reporter,
            token
        })
    } catch (e) {
        res.status(400).send(e.message)
    }
})
router.get('/profile',auth,async (req,res)=>{
    res.status(200).send(req.reporter)
})

router.patch('/profile',auth,async (req,res)=>{
    try{
        const updates = Object.keys(req.body)
        const allowToUpdate = ['name','age','password','phone']
        const isValid = updates.every((el)=>allowToUpdate.includes(el))
        if(!isValid){
            return res.status(500).send("Can't update")
        }
        
        const reporter = await Reporter.findOne({_id:req.reporter._id})
        if(!reporter){
            return res.status(404).send("No user Founded")
        }

        updates.forEach((el)=>{
            reporter[el] = req.body[el]
        })
        await reporter.save()
        res.status(200).send(reporter)

    }catch(e){
        res.status(400).send(e.message)
    }
})

router.delete('/profile',auth,async (req,res)=>{
    try{
        const reporter = await Reporter.findOneAndDelete({_id:req.reporter._id})
        if(!reporter){
            return res.status(404).send("No user Founded")
        }

     }catch(e){
        res.status(500).send(e.message)
     }
})

router.delete('/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((el)=>{
            return el !== req.token
        })
        await req.user.save()
        res.status(200).send()
    }catch(e){
        res.status(500).send(e)
    }
})
module.exports = router 