const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const upload = require("../../helpers/multer");
const { userAuthHandler } = require("../../middlewares");
const {body, validationResult} = require('express-validator')
const User = require('../../model/User');
const Image = require("../../model/Image");
const Review = require("../../model/Review");
const Place = require("../../model/Place");
router.use(userAuthHandler);

router.get("/", (req, res) => {
  const { user } = req;
  res.json(user);
});

const imageUpload = upload.single("image");

const validEmail = body('email').optional().normalizeEmail().isEmail().withMessage("Invalid Email ID")
  .custom((value, {req})=>{
    const {user} = req;
    console.log(value)
    if(user.email===value) return true;
    return User.findOne({email: value}).then((user)=>{
      if(user) return Promise.reject("Email Already in Use");

      return true;
    })
  }).withMessage("Email Already in use.")

const validPassword = body('newPassword').isString().isLength({min:5});
const validOldPassword = body('oldPassword').notEmpty();

router.put("/", validEmail, imageUpload, async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user } = req;
    const { name, email } = req.body;
    const image = req.file;
    if (name) user.name = name;
    if (email) user.email = email;
    if (image) user.image =`/images/${image.filename}`
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put("/changepassword", validPassword, validOldPassword, async (req, res,next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    const correctPassword = await bcrypt.compare(oldPassword,user.password)
    if (!correctPassword)
      return res.status(400).json({ message: "Incorrect Password" });
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json(user);
  } catch (err) {
    next(err)
  }
});

router.get('/images',async(req,res,next)=>{
  try{
    const images = await Image.find({user: req.user.id});
    res.json({data: images});
  }catch(err){
    next(err)
  }
})

router.get('/reviews',async(req,res,next)=>{
  try{
    const reviews = await Review.find({user: req.user.id});
    res.json({data: reviews});
  }catch(err){
    next(err)
  }
})

router.get('/places',async(req,res,next)=>{
  try{
    const places = await Place.find({user: req.user.id});
    res.json({data: places});
  }catch(err){
    next(err)
  }
})


module.exports = router;
