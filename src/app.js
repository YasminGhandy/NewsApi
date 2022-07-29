const express = require('express')
const reporterRouter = require('./router/reporter')
const newsRouter = require('./router/news')
const app = express()
require('dotenv').config()
const port = process.env.port

require('./db/mongoose')
app.use(express.json())
app.use(reporterRouter)
app.use(newsRouter)

app.listen(port,()=>{
    console.log('sever is running '+ port)
})