const router=require('express').Router()
const {getAllUser,createUser,getSingleUser,editUser,deleteUser,getProfile}=require('../controller/userController')
const{isAuthenticate}=require('../middleware/authMiddleware')


router.post('/create',isAuthenticate,createUser)
router.get('/get-all',isAuthenticate,getAllUser)
router.get('/get-user/:userId',isAuthenticate,getSingleUser)
router.post('/edit/:userId',isAuthenticate,editUser)
router.delete('/delete/:userId',isAuthenticate,deleteUser)
router.get('/',isAuthenticate,getProfile)

module.exports=router