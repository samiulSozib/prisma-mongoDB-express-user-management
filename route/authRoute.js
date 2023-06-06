const router=require('express').Router()
const{registerUser,login,logout,verifyEmail,forgetPassword,resetPassword}=require('../controller/authController')

router.post('/register',registerUser)
router.post('/login',login)
router.get('/logout',logout)
router.get('/verify/:varificationCode',verifyEmail)
router.get('/forget-password',forgetPassword)
router.post('/reset-password/:userId',resetPassword)

module.exports=router