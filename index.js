const express=require('express')
const setRoute=require('./route/route')
const setMiddleware=require('./middleware/middleware')
const dotenv=require('dotenv')
const cors=require('cors')
const cookieParser=require('cookie-parser')
const sessions=require('express-session')


const app=express();
dotenv.config()
app.use(cors({ credentials: true, origin: '' }))

const time=1000*60*60;

app.use(sessions({
    secret:process.env.SESSION_SECRET,
    saveUninitialized:true,
    cookie:{maxAge:time},
    resave:false
}))

app.use(cookieParser())
setMiddleware(app)
setRoute(app)



app.listen(1000,()=>{
    console.log('server created success')
})

