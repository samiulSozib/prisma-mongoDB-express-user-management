const authRoute=require('./authRoute')
const userRoute=require('./userRoute')
const routes=[
    {
        path:'/api/user',
        hanlder:userRoute
    },
    {
        path:'/api/auth',
        hanlder:authRoute
    },
    {
    path:'/',
    hanlder:(req,res)=>{
        return res.json({msg:'Welcome to my application'})
    }
}]

module.exports=(app)=>{
    routes.forEach(r=>{
        if(r.path=='/'){
            app.get(r.path,r.hanlder);
        }else{
            app.use(r.path,r.hanlder)
        }
    })
}