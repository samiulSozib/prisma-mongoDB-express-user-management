const jwt=require('jsonwebtoken')
const {PrismaClient}=require('@prisma/client')
const prisma=new PrismaClient()

exports.isAuthenticate=async(req,res,next)=>{
    try{
        let token=req.session.token
        if(!token){
            return res.status(403).json({msg:'No token provided'})
        }
        
        jwt.verify(token,process.env.JET_SECRET,async(err,decode)=>{
            if(err){
                return res.status(401).json({msg:'Invalid token'})
            }
            const user=await prisma.user.findUnique({
                where:{
                    id:decode.userId
                }
            })
            req.user={id:user.id,role:user.role}
            next()
        })
       
    }catch(e){
        return res.json({msg:'Token Error'})
    }
}

exports.isAdmin=async(req,res,next)=>{
    try{
        const id=req.user
        console.log(id)
        const user = await prisma.user.findUnique({
            where: {
              id: id
            }
          });
          if(user.role=="admin"){
            next();
          }else{
            return res.status(404).json({msg:'Not admin'})
          }
    }catch(e){
        return res.status(404).json({msg:'Not admin'})
    }
}

exports.isSupport=async(req,res,next)=>{
    try{
        const id=req.user
        const user = await prisma.user.findUnique({
            where: {
              id: id
            }
          });
          if(user.role=="support"){
            next();
          }else{
            return res.status(404).json({msg:'Not support'})
          }
    }catch(e){
        return res.status(404).json({msg:'Not support'})
    }
}

exports.isUser=async(req,res,next)=>{
    try{
        const id=req.user
        const user = await prisma.user.findUnique({
            where: {
              id: id
            }
          });
          if(user.role=="user"){
            next();
          }else{
            return res.status(404).json({msg:'Not user'})
          }
    }catch(e){
        return res.status(404).json({msg:'Not user'})
    }
}