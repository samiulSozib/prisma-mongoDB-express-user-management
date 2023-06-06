const express=require('express')
const morgan=require('morgan')


const middleware=[
    morgan('dev'),
    express.urlencoded({extended:true}),
    express.json()
]

module.exports=(app)=>{
    middleware.forEach(m=>{
        app.use(m)
    })
}