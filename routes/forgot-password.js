// var express = require('express');
// var router = require('./index')
// const userModel = require('./users');


// router.post('/forgot-password',async (req,res) => {
//   const {email} = req.body;
//   console.log(email);
//   const foundUser = await userModel.findOne({email});
//   if(!foundUser){
//     res.status(401).json({
//       message:'User Not Registered'
//     });
//   }
// })