//jshint esversion:6
require('dotenv').config()                 //require it as early as possible in your app, no const required for this
const express= require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")

//mongoose encrypt will automatically encrypt encryptedField behind the scene, when .save() is called and it will automatically decrypt when .find() is called.

const app = express()

console.log(process.env.API_KEY)

app.use(express.static("public"))
app.set("view engine", "ejs" )
app.use(bodyParser.urlencoded({extended:true}))

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema= new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]})

const User= mongoose.model("User", userSchema)

app.get("/", function(req,res){
  res.render("home")
})

app.get("/login", function(req,res){
  res.render("login")
})

app.get("/register", function(req,res){
  res.render("register")
})

app.post("/register", function(req,res){
  const newUser= new User({
    email: req.body.username,
    password: req.body.password
  })
  newUser.save().then(function(done,err){
    if(!err){
      res.render("secrets")
    }
    else{
      console.log(err)
    }
  })
})

app.post("/login", function(req,res){
  const username = req.body.username
  const password = req.body.password
  User.findOne({email:username}).then(function(foundUser,err){
    if(err){
      console.log(err)
    }
    else{
      if(foundUser){
        if(foundUser.password===password){
          res.render("secrets")
        }
      }
    }
  })
})

app.listen(3000, function(){
  console.log("Sever is started on port 3000")
})
