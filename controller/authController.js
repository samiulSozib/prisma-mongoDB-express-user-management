const {PrismaClient}=require('@prisma/client')
const prisma=new PrismaClient()
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const sendMail=require('../config/nodemailerConfig')
const sendResetMail=require('../config/restEmailConfig')


exports.registerUser=async(req,res,next)=>{
    const {email,name,password,role}=req.body

    try{
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
        
        return res.status(200).json({msg:'Account create success, Please Verify your email'})
    }catch(e){
        console.log(e)
        return res.status(404).json({msg:'Failed to create user'})
    }
}


exports.login=async(req,res,next)=>{
    try{
        const {email,password}=req.body
        const isUserPresent=await prisma.user.findFirst({
            where:{
                email:email
            }
        })
        if(!isUserPresent){
            return res.status(404).json({msg:'Please provide corect Credentials'});
        }
        const isPasswordMatch=await bcrypt.compare(password,isUserPresent.password);
        if(!isPasswordMatch){
            return res.status(404).json({msg:'Please provide corect Credentials'});
        }
        if(isUserPresent.status==="Pending"){
            return res.status(401).json({msg:'Please verify Email'})
        }
        const userId=isUserPresent.id
        const token=jwt.sign({userId},process.env.JET_SECRET,{expiresIn:1000*60*60})
        req.session.token=token
        return res.status(200).json({msg:'Login Success'})
        
    }catch(e){
        console.log(e)
        return res.status(404).json({msg:'Failed to login'})
    }
}

exports.logout=async(req,res,next)=>{
    try{
        req.session=null
        return res.status(200).json({msg:'Logout success'})
    }catch(e){
        console.log(e)
        return res.status(404).json({msg:'Failed to logout'})
    }
}



exports.verifyEmail=async(req,res,next)=>{
    try{
        const {varificationCode}=req.params
        const user=await prisma.user.findUnique({
            where:{
                varificationCode:varificationCode
            }
        })
        if(!user){
            return res.status(404).json({msg:'No user fount'})
        }
        if(user.status==='Pending'){
            await prisma.user.update({
                where: {
                  varificationCode: varificationCode
                },
                data: {
                  status:'Active'
                }
              }); 
        }
        return res.status(200).json({msg:'Email Verify Success'})
    }catch(e){
        console.log(e)
        return res.status(404).json({msg:'Failed to Verify'})
    }
}


// forget password 

exports.forgetPassword=async(req,res,next)=>{
    try{
        const {email}=req.body
        const user=await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(!user){
            return res.status(404).json({msg:'Email invalid'})
        }
        sendResetMail({email:user.email,name:user.name,id:user.id})
        return res.status(200).json({msg:'Email Send Please Check'})
    }catch(e){
        console.log(e)
        return res.status(404).json({msg:'Failed to send email'})
    }
}


// reset password 

exports.resetPassword=async(req,res,next)=>{
    try{
        const {userId}=req.params
        const {password}=req.body

        const user=await prisma.user.findUnique({
            where:{
                id:userId
            }
        })
        if(!user){
            return res.status(404).json({msg:'User not found'})
        }
        const salt=await bcrypt.genSalt(10);
        const hashPassword=await bcrypt.hash(password,salt);
        await prisma.user.update({
            where: {
              id: userId
            },
            data: {
              password:hashPassword,
            }
          }); 
          return res.status(200).json({msg:'Password Reset Success'})
    }catch(e){
        console.log(e)
        return res.status(404).json({msg:'Failed to reset password'})
    }
}