require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const flash = require('connect-flash');
const bodyparser = require("body-parser");
const user = require("./models/user");

app.set("view engine", "ejs");

// middlewares
app.use(express.static("public"));
app.use(cookieParser(process.env.secret));
app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
  })
);
app.use(flash());
app.use(bodyparser.urlencoded({extended:true}));

mongoose
  .connect("mongodb://localhost:27017/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to mongodb.");
  })
  .catch((e) => {
    console.log(e);
  });

app.get("/",(req,res)=>{
  req.flash("Success_msg"," Successfully get to the homepage ");
  res.send("Hi " + req.flash("Success_msg"));
});

app.get("/login",(req,res, next)=>{
    res.render("login.ejs");
})

app.post("/login",async (req,res)=>{
  let {username , password } = req.body;
  try{
    let founduser = await user.findOne({username});
    if(founduser && password == founduser.password){
      res.render("secret");
    }else{
      res.send("username or password nor correct.");
    }
  }catch{
    next(e);
  }
});

app.get("/signup",(req,res)=>{
  res.render("signup.ejs");
});

app.post("/signup",(req,res,next)=>{
    let { username , password } = req.body;
    let newuser = new user({username , password});
  try{
    newuser
    .save()
    .then(()=>{
      res.send("data has been saved.");
    })
    .catch((e)=>{
      res.send("ERROR !!!");
      console.log(e);
    });
  } catch (err){
    next(err);
  }    
});

 app.get("/*",(req,res)=>{
    res.status(404).send("404 page not found.");
 });

  // error handler
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send('Something broke!')
  })

app.listen(3000, () => {
  console.log("Server running on port 3000.");
});
