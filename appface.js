//-------------include necessary files -------------------
//jshint esversion:6
require("dotenv").config();
const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const ejs=require("ejs");
const encryption=require("mongoose-encryption");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const FacebookStrategy=require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-find-or-create");




// ---------------------
const app=express();


// ------------------Use and set app 
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret:"our little secret",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());

//-------------mongodb setup--------
mongoose.connect("mongodb://0.0.0.0:27017/tryDB");

const userSchema= new mongoose.Schema({
     email:String,
     password:String,
     googleId:String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// const findOrCreate = require("mongoose-find-or-create");

const User= new mongoose.model("user",userSchema);

//-------------Serialize and Deserialize---------------

passport.use(User.createStrategy());
passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    })
})


passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


//------------------LEVEL -2 encryption method ------------
// const secret="ITS MY SECRET";
// userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});



//--------------requests


app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/auth/facebook",
  passport.authenticate('facebook', { scope: ["profile"] }
  ));

app.get("/auth/facebook/secrets",
  passport.authenticate('facebook', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });


app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.post("/register",(req,res)=>{

    User.register({username:req.body.username},req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    })


//--------------------Method : without using passport ------------------------
//   const newUser=new User({
//     email:req.body.username,
//     password:req.body.password
//   })
    
//    newUser.save((err)=>{
//     if(err){
//         console.log(err)
//     }else{
//         res.render("secrets");
//     }
//    })
})

app.post("/login",(req,res)=>{
    const user=new User({
        username:req.body.username,
        password:req.body.password
    })
     
    req.login(user,(err)=>{
        if(err){
            console.log(err)
        }
        else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets");
            });
        }
    })

    //------------------Method : without using passport --------------------------------

    // const username=req.body.username;
    // const password=req.body.password;
    // User.findOne({email:username},(err,foundUser)=>{
    //     if(err){
    //         console.log(err)
    //     }else{
    //         if(foundUser){
    //             if(foundUser.password===password){
    //                 res.render("secrets");
    //             }
    //         }
            
    //     }
    // })
})



app.listen(3000,()=>{
    console.log("Succesfully connected to 3000 port ")
})