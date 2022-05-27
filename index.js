const express=require('express');
const app=express();
const port=3000;
const bodyparser=require('body-parser');
const path=require('path');
const validator=require('express-validator');
const encrypt=require('mongoose-encryption');
const session = require('express-session');
app.use(session({secret: 'mySecret', resave: false, saveUninitialized: false}));
//db
const mongoose=require('mongoose');
const { stringify } = require('querystring');
const { url } = require('inspector');
const req = require('express/lib/request');
mongoose.connect('mongodb://localhost:27017/dukaan',{useNewUrlParser:true});
const productlistSchema=new mongoose.Schema({
    category : String,
    name: String,
    price : String,
    image : String,
    qty : Number
})
const itemSchema=new mongoose.Schema({
    category : String,
    name: String,
    price : String,
    image : String,
    qty : Number,
    pid : String
})

const userSchema=new mongoose.Schema({
    name : String,
    email : String,
    phone : Number,
    city : String,
    state : String,
    password : String,
    cart : [itemSchema]
});

                   //password encryption
const secret="This_is_secret_for_password_encryption";
userSchema.plugin(encrypt,{secret : secret,encryptedFields:['password']});
const User=mongoose.model('User',userSchema);

const Product=mongoose.model('Product',productlistSchema);


//body_parser
app.use(bodyparser.urlencoded({extended:true}));

//set static path
app.use(express.static(path.join(__dirname,"public")));

//set views
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//Routes
app.get('/',(req,res)=>{
    Product.find(function(err,products){
        if(err) console.log(err);
        else{
            // console.log(products);
            res.render('home',{products : products});
        }
      
    });
    
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
                    Product.find(function(err,products){
                        if(err) console.log(err);
                        else{
                            // console.log(products);
                            // res.render('profile',{name: thatuser.name,products: products});
                            // console.log(products);
                            req.session.message={user: thatuser,products: products};
                            res.redirect('/profile');
                        }
                      
                    });
                   
                }
                else res.render('login',{stat : "danger",message:"Incorrect password!"});
            }
            else res.render('login',{stat : "danger",message:"It seems that your email is not registered. Kindly create your account first!!!"});
        }
    });
});
app.get('/profile',(req,res)=>{
    // res.render('profile');
    // console.log(req.session.message);
    res.render('profile',req.session.message);
});
app.post('/profile',(req,res)=>{
    // console.log(req.body.userid);
    User.findById(req.body.userid,(err,user)=>{
        if(err) console.log(err);
        Product.find(function(err,products){
            if(err) console.log(err);
            else
            res.render('profile',{user: user,products: products});
        })
    })
})
app.get('/cart',(req,res)=>{
    res.render('cart',req.session.message);
});

app.post('/cart',(req,res)=>{
    User.findById(req.body.cart,(err,user)=>{
        res.render('cart',{user : user});
    })
})
app.post('/addcart',(req,res)=>{
    let item_id="";
    for (let index = 0; index < 24; index++) {
        item_id=item_id+req.body.addcart[index];
    }
    
    let user_id="";
    for (let index = 25; index < req.body.addcart.length; index++) {
        user_id=user_id+req.body.addcart[index];
    }
    
    Product.findById(item_id,(err,item)=>{
        User.findById(user_id,(err,user)=>{
            // console.log(user);
            let a=1;
            for (let index = 0; index < user.cart.length; index++) {
                const element = user.cart[index];
                if(element.pid==item_id){
                    // console.log("already in cart");
                    a=0;
                    break;
                }
            }
            if(a){
                user.cart.push({
                    category : item.category,
                    name: item.name,
                    price : item.price,
                    image : item.image,
                    qty : 1,
                    pid : item_id
                })
                user.save();
                Product.find(function(err,products){
                        if(err) console.log(err);
                        else{
                            req.session.message={user: user,products: products};
                            res.redirect('/profile');
                        }
                    })
            }
            else{
                req.session.message={user : user};
                res.redirect('/cart');
            }
            
           
        })
    })
})
app.post('/remove',(req,res)=>{
    let user_id="";
    for (let index = 0; index < 24; index++) {
        user_id=user_id+req.body.item_pos[index];
    }
    
    let i="";
    for (let index = 25; index < req.body.item_pos.length; index++) {
        i=i+req.body.item_pos[index];
    }
    // console.log(i);
    User.findById(user_id,(err,user)=>{
        if(err) console.log(err);
        else{
            user.cart.splice(i,1);
            user.save();
            req.session.message={user : user};
            res.redirect('/cart');
        }
    })

})
app.post('/increase',(req,res)=>{
    let user_id="";
    for (let index = 0; index < 24; index++) {
        user_id=user_id+req.body.item_pos[index];
    }
    
    let i="";
    for (let index = 25; index < req.body.item_pos.length; index++) {
        i=i+req.body.item_pos[index];
    }
    let j = parseInt(i);
    User.findById(user_id,(err,user)=>{
        if(err) console.log(err);
        else{
           (user.cart[j].qty)++;
            user.save();
            req.session.message={user : user};
            res.redirect('/cart');
        }
    })

})
app.post('/decrease',(req,res)=>{
    let user_id="";
    for (let index = 0; index < 24; index++) {
        user_id=user_id+req.body.item_pos[index];
    }
    
    let i="";
    for (let index = 25; index < req.body.item_pos.length; index++) {
        i=i+req.body.item_pos[index];
    }
    let j = parseInt(i);
    User.findById(user_id,(err,user)=>{
        if(err) console.log(err);
        else{
            if(user.cart[j].qty>=2){
            (user.cart[j].qty)--;
            user.save();
            }
            req.session.message={user : user};
            res.redirect('/cart');
        }
    })

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
        User.findOne({email: req.body.email},function(err,thatuser){
            if(err) console.log(err);
            else{
                if(thatuser){
                    res.render('signup',{stat: "danger",message:"This email is already registered!"});
                }
                else{
                user.save();
                Product.find(function(err,products){
                    if(err) console.log(err);
                    else{
                        req.session.message={user: user,products: products};
                        res.redirect('/profile');
                    }
                  
                });
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
