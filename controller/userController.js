const {PrismaClient}=require('@prisma/client')
const prisma=new PrismaClient()
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const sendMail=require('../config/nodemailerConfig')

// create user 
exports.createUser=async(req,res,next)=>{
    try{
        const currRole=req.user.role
        const {email,name,password,role}=req.body
        const isUserPresent=await prisma.user.findFirst({
            where:{
                email:email
            }
        })
        if(isUserPresent){
            return res.status(404).json({msg:'User already exists'})
        }
        const salt=await bcrypt.genSalt(10);
        const hashPassword=await bcrypt.hash(password,salt);
        const _varificationCode=jwt.sign({email},process.env.VERIFICATION_CODE_SECRET)
        if(currRole==='admin' || currRole==='support'){
            if(currRole==='support' && role==='admin'){
                return res.status(403).json({msg:'You can not add a admin'})
            }else{
                const user=await prisma.user.create({
                    data:{
                        email,
                        name,
                        password:hashPassword,
                        role:role,
                        status:'Pending',
                        varificationCode:_varificationCode
                    }
                })
                sendMail({email:user.email,name:user.name,varificationCode:_varificationCode})
                return res.status(200).json({msg:'User create success'})
            }
        }
    }catch(e){
        console.log(e)
        return res.status(404).json({msg:'Faild to create  user'})
    }
}


// get all user 
exports.getAllUser=async(req,res,next)=>{
    try{
        const currRole=req.user.role
        if(currRole==="admin"|| currRole==="support"){
            const users=await prisma.user.findMany()
            return res.status(200).json({data:users})
        }else{
            return res.status(403).json({msg:'You are not a admin or support'})
        }
        
    }catch(e){
        return res.status(404).json({msg:'Faild'})
    }
}

// get single  user 
exports.getSingleUser=async(req,res,next)=>{
    try{
        const currRole=req.user.role
        const {userId}=req.params
        if(currRole==="admin"|| currRole==="support"){
            const user=await prisma.user.findUnique({where:{id:userId}})
            if(user.role!=='admin'){
                return res.status(200).json({data:user})
            }
            else{
                return res.status(403).json({msg:'You can not see this user'})
            }
        }else{
            return res.status(403).json({msg:'You are not a admin or support'})
        }
        
    }catch(e){
        return res.status(404).json({msg:'Faild'})
    }
}

// edit user 

exports.editUser=async(req,res,next)=>{
    try{
        const currRole=req.user.role
        console.log(req.user.id)
        const {userId}=req.params
        const {email,name,password,role}=req.body
        const user=await prisma.user.findUnique({where:{id:userId}})

        const salt=await bcrypt.genSalt(10);
        const hashPassword=await bcrypt.hash(password,salt);
        
        // eidt personal profile
        if(user.id===req.user.id){
            await prisma.user.update({
                where: {
                  id: userId
                },
                data: {
                  email: email,
                  name:name,
                  password:hashPassword,
                  role:role
                }
              }); 
              return res.status(200).json({msg:'Update success1'})             
        }
        // eidt user
        else{
            if(user.role==='admin' && currRole==='support'){
                return res.status(403).json({msg:'You can not eidt this user'})
            }else{
                await prisma.user.update({
                    where: {
                      id: userId
                    },
                    data: {
                      email: email,
                      name:name,
                      password:hashPassword,
                      role:role
                    }
                  }); 
                  return res.status(200).json({msg:'Update success'}) 
            }
        }
        
    }catch(e){
        return res.status(404).json({msg:'Faild'})
    }
}

// delete user 

exports.deleteUser=async(req,res,next)=>{
    try{
        const currRole=req.user.role
        const {userId}=req.params
        const user=await prisma.user.findUnique({
            where:{
                id:userId
            }
        })
        if(req.user.id===user.id){
            // personal id delete 
            await prisma.user.delete({
                where: {
                  id: user.id
                }
              });
              return res.status(200).json({msg:'User delete success'})
              
        }else{
            if(currRole==='support' && user.role==='admin'){
                return res.status(403).json({msg:'You can not delete this user'})
            }else{
                await prisma.user.delete({
                    where: {
                      id: user.id
                    }
                  });
                  return res.status(200).json({msg:'User delete success'})
            }
        }
    }catch(e){
        return res.status(404).json({msg:'Faild'})
    }
}

// get profile 

exports.getProfile=async(req,res,next)=>{
    try{
        const userId=req.user.id 
        const user=await prisma.user.findUnique({where:{id:userId}})
        return res.status(200).json({profile:user})
    }catch(e){
        return res.status(404).json({msg:'Faild'})
    }
}