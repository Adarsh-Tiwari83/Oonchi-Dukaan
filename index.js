const express=require('express');
const app=express();
const port=3000;
const bodyparser=require('body-parser');
const path=require('path');
const validator=require('express-validator');

//db
const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/dukaan',{useNewUrlParser:true});
const userSchema=new mongoose.Schema({
    name : String,
    email : String,
    phone : Number,
    city : String,
    state : String,
    password : String
});
const User=mongoose.model('User',userSchema);

//body_parser
app.use(bodyparser.urlencoded({extended:true}));

//set static path
app.use(express.static(path.join(__dirname,"public")));

//set views
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//Routes
app.get('/',(req,res)=>{
    res.render('home');
});
app.get('/login',(req,res)=>{
    res.render('login',{stat : "info",message:"Enter your email and password!"});
});
app.post('/login',(req,res)=>{
    let email=req.body.email;
    let password=req.body.pass;
    User.findOne({email: email},(err,thatuser)=>{
        if(err) console.log(err);
        else{
            if(thatuser){
                if(thatuser.password===password){
                    res.render('profile',{name: thatuser.name});
                }
                else res.render('login',{stat : "danger",message:"Incorrect password!"});
            }
            else res.render('login',{stat : "danger",message:"It seems that your email is not registered. Kindly create your account first!!!"});
        }
    });
});
app.get('/cart',(req,res)=>{
    res.render('cart');
})
app.get('/signup',(req,res)=>{
    let mess={stat :"info",message:"Enter the details below!"}
        res.render('signup',mess);
});
app.post('/signup',(req,res)=>{
    const user=new User({
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        city : req.body.city,
        state : req.body.state,
        password : req.body.pass,
    });
    if(req.body.pass===req.body.cpass){
        User.find(function(err,emails){
            if(err) console.log(err);
            else{
                let a=0;
                for (let index = 0; index < emails.length; index++) {
                const element = emails[index];
                    if(user.email === element.email){
                        a=1;
                        res.render('signup',{stat: "danger",message:"This email is already registered!"});
                        break;
                    }
                }
                if(a==0){
                user.save();
                res.render('signup',{stat: "success",message:"You are successfully registered. You can login now and see your profile page!"});
                }
            }
        })
    }
    else{
        let mess={stat :"danger",message:"Passwords do not match!"}
        res.render('signup',mess);
    }
})

//listen server
app.listen(port,()=>{
    console.log(`Server is listening at http://localhost:${port}`);
})