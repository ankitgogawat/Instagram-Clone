const express=require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");

router.get('/allpost',requireLogin,(req,res)=>{
  Post.find()
  .populate("postedBy","_id name")
  .then(posts=>{
    res.json({posts});
  })
  .catch(err=>{
    console.log(err);
  })
})

router.post('/createpost',requireLogin,(req,res)=>{
  const {title,body,pic} = req.body
  if(!title || !body || !pic){
    return res.status(422).json({error:"Please add required fields"})
  }
  req.user.password = undefined;
  const post = new Post({
    title:title,
    body:body,
    photo:pic,
    postedBy:req.user
  })
  post.save().then(result=>{
    res.json({post:result})
  })
  .catch(err=>{
    console.log(err);
  })
})

//posted by a user
router.get('/myposts',requireLogin,(req,res)=>{
  Post.find({postedBy:req.user._id})
  .populate("postedBy","_id name")
  .then(mypost=>{
    res.json({mypost})
  })
  .catch(err=>{
    console.log(err);
  })
})

//For Like and Dislike
router.put('/like',requireLogin,(req,res)=>{
  Post.findByIdAndUpdate(req.body.postId,{
    $push:{likes:req.user._id}
  },{
    new:true
  }).exec((err,result)=>{
    if(err){
        return res.status(422).json({error:err})
    } else{
      res.json(result)
    }
  })
})

router.put('/dislike',requireLogin,(req,res)=>{
  Post.findByIdAndUpdate(req.body.postId,{
    $pull:{likes:req.user._id}
  },{
    new:true
  }).exec((err,result)=>{
    if(err){
        return res.status(422).json({error:err})
    } else{
      res.json(result)
    }
  })
})

//Comment

router.put('/comment',requireLogin,(req,res)=>{
  const comment = {
    text:req.body.text,
    postedBy:req.user._id
  }
  Post.findByIdAndUpdate(req.body.postId,{
    $push:{comments:comment}
  },{
    new:true
  })
  .populate("comments.postedBy","_id name")
  .exec((err,result)=>{
    if(err){
        return res.status(422).json({error:err})
    } else{
      res.json(result)
    }
  })
})

module.exports = router
