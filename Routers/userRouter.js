const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController')


const router = express.Router();

router.post('/signin',authController.signin);
router.post('/login',authController.login);
router.get('/logout',authController.logout);  
router.post('/forgotPassword',authController.forgetPassword);
router.post('/resetPassword/:token',authController.resetPassword);

router.use(authController.protect);

router.get('/me',userController.getme,userController.getUser);
router.patch('/updatePassword',authController.updatePassword);
router.patch('/updateme',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateme);
router.delete('/deleteme',userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
