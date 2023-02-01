// require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Router = require('./routes/server')
const bcrypt = require('bcrypt');
const session = require("express-session");
const User = require("./models/Main");
var cookieParser = require("cookie-parser");
const saltRounds = 6;
var userFound = ""


//Date Generation
var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 
    
    if(mm<10) 
    {
        mm='0'+mm;
    } 
today = mm+'-'+dd+'-'+yyyy;


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(cookieParser());

app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    },
  })
);

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});


var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/main");
  } else {
    next();
  }
};

app.get("/", sessionChecker, (req, res) => {
  res.render("home");
});


app
  .route("/signup")
  .get(sessionChecker, (req, res) => {
    res.render("signup");
  })
  .post((req, res) => {

    var user = new User({
      email: req.body.email,
      password:req.body.password,
    });
    user.save((err, docs) => {
      if (err) {
        res.redirect("/signup");
      } else {
          console.log(docs)
        req.session.user = docs;
        res.render("signin");
      }
    });
  });


app
  .route("/signin")
  .get(sessionChecker, (req, res) => {
    res.render("signin");
  })
  .post(async (req, res) => {
      var email = req.body.email;
      var password = req.body.password;

      try {
        var user = await User.findOne({ email: email }).exec();
        if(!user) {
            res.redirect("/signin");
        }
        user.comparePassword(password, (error, match) => {
            if(!match) {
              res.render("signin");
            }
        });
        req.session.user = user;
        res.redirect("/main");
        var foundUser = req.session.user.email
        userFound = foundUser

    } catch (error) {
      console.log(error)
    }
});



// route for user's dashboard
app.get("/main", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    User.findOne({email: userFound}, (err,docs) =>{ 
      if(err){
        console.log(err)
      } else{
        var birthdayDetails = docs.birthdays;
        console.log(birthdayDetails)
        res.render("main", {finalDetails: birthdayDetails })
      }
    })
  }
  else{
    res.render("signin")
  }
})

// Compose
app.get("/compose",(req,res) =>{
  if (req.session.user && req.cookies.user_sid) {
    res.render("compose")
  } else{
    res.redirect("/signin")
  }
})

app.get("/birthdays",(req,res) =>{
  if (req.session.user && req.cookies.user_sid) {
    res.render("birthdays")
  } else{
    res.redirect("/signin")
  }
})

app.post("/compose", (req,res) =>{
  var details = {
    person_name: req.body.personName,
    date: req.body.birthdayDate,
    relType: req.body.relType
  }

  User.findOne({email: userFound}, (err,docs) =>{
    if(err){
      console.log(err)
    }
    else{
      try{
        console.log(docs.birthdays)
        docs.birthdays.push(details)
        docs.save()
        console.log(docs)
      }
      catch (e){
        if(e instanceof TypeError){
          console.log("Error catched")
        }
        else{
          console.log(e)
        }
      }
    }

    console.log(docs)
    res.render("main", {finalDetails: docs.birthdays })
  })
  
})

// route for user logout
app.get("/signout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

app.get("/new", (req,res) =>{
  res.render("new.ejs")
})

app.get("/about", (req,res) =>{
  res.render("about.ejs")
})

app.listen(8000, ()=>{
    console.log("App started at the port 8000");
});