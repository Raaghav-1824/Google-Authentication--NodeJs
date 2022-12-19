// ---------------------------------------------------Google authorization----------------------------------
//jshint esversion:6
require("dotenv").config()
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const app=express();
const mongoose=require("mongoose");
//-----------------------------------------------
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-find-or-create");

// ----------------------------------------------------------------
// const encrypt=require("mongoose-encryption");
// const bcrypt=require("bcrypt");
// const md5 =require("md5");
//--------------------------------------------------------------

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:"that's our secret.",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/useDB");


const userSchema= new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User =  new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
// passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
// used to serialize the user for the session

//--------------------------------------------------------

passport.serializeUser(function(user, done) {
    done(null, user.id); 
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


//----------Encryption Method---------------
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ["password"] })

passport.use(new GoogleStrategy({
    clientID:  process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/",(req,res)=>{
    res.render("home")
})



app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });

app.get("/submit",(req,res)=>{
    if(req.isAuthenticated){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
    
})


app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/secrets",(req,res)=>{
    User.find({"secret":{$ne:null}},(err,foundUser)=>{
        if(err){
            console.log(err)
        }else{
            if(foundUser){
               res.render("secrets",{userWithsecrets:foundUser});
               console.log(foundUser)
            }
            
        }

    })
//     if(req.isAuthenticated){
//         res.render("secrets");
//     }else{
//         res.redirect("/login");
//     }
})

app.get("/logout",(req,res)=>{
    // req.logout();
    res.redirect("/");
})

app.post("/register",(req,res)=>{

    User.register({username:req.body.username},req.body.password,(err,user)=>{
        if(err){
            res.redirect("/register");
            console.log(err)
        }else{
           passport.authenticate("local")(req,res,()=>{
            res.redirect("/secrets")
           })
        }

    })

});


app.post("/login",(req,res)=>{

    const user=new User({
        email:req.body.username,
        password:req.body.password
    })

    req.login(user,(err)=>{
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req,res,()=>{
             res.redirect("/secrets")
            })
         }
    })
    
})

app.post("/submit",(req,res)=>{
  const submittedSecret=req.body.secret;

//   console.log(req.user.id);
  User.findById(req.user.id,(err,foundUser)=>{
    if(foundUser){
        foundUser.secret=submittedSecret;
        foundUser.save(()=>{
            res.redirect("/secrets")
            // console.log("Successfully run")
        })
    }

    })
});


















//-------------------encription based on md5, bcrypt , hashsing  and salting ------------------------------

// app.post("/register",(req,res)=>{
//     bcrypt.hash(req.body.password, 10, function(err, hash) {
//         const newUser=new User({
//             email:req.body.username,
//             password:hash
//         })

//         newUser.save((err)=>{
//             if(err){
//                 res.send(err)
//             }else{
//                 res.render("secrets")
//             }
//         })
        
//     });

    
// })



// app.post("/login",(req,res)=>{
//     const userName=req.body.username;
//     const password=req.body.password;
//     // console.log(password);
//     User.findOne({email:userName},(err,foundUser)=>{
//         if(err){
//             console.log(err)
//         }else{
//             if(foundUser){
//                 bcrypt.compare(password, foundUser.password, function(err, result) {
//                     // result == true
//                     if(result===true){
//                         res.render("secrets");
//                         console.log("Credentials Matched ! ")
//                     }
//                     else{
//                         res.send("<h1>credentials not found !</h1>")
//                     }
                    
//                 });
//             } 
//         }
//     })



// })

app.listen(3000,()=>{
    console.log("Port connected to 3000")
})
