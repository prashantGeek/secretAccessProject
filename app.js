//jshint esversion:6
require('dotenv').config()                 //require it as early as possible in your app, no const required for this
const express= require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()

app.use(express.static("public"))
app.set("view engine", "ejs" )
app.use(bodyParser.urlencoded({extended:true}))

//app.use for session to be placed specifically after all the "app.use and app.set" and above mongoose.connect
app.use(session({
  secret:"Our little secret.",          //to sign the session ID Cookie.
  resave:false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema= new mongoose.Schema({        //mongoose word is added to make it a mongoose schema, not a simple js Object
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose);

const User= mongoose.model("User", userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", function(req,res){
  res.render("home")
})

app.get("/login", function(req,res){
  res.render("login")
})

app.get("/register", function(req,res){
  res.render("register")
})

app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets")
  }
  else{
    res.redirect("login")
  }
})

app.get("/logout", function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err)
    }else{
      res.redirect("/")
    }
  });
  
})

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){   //passport method
    if(err){
      console.log(err)
      res.redirect("/register")
    }
    else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets")
      })
    }
  })
})

app.post("/login", function(req,res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, function(err){                 //passport method
    if(err){
      console.log(err)
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets")
      })
    }
  })
})

app.listen(3000, function(){
  console.log("Sever is started on port 3000")
})
