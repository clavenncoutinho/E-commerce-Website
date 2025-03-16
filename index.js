const express=require("express");
const app=express();
const http=require("http");
const fs=require("fs");
const port="3000";
const mongoose=require("mongoose");
const path=require("path");
const { type } = require("os");
const bcrypt=require("bcrypt");   //used to hash paasword
require("dotenv").config();

const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

app.use(cors());

console.log(process.env.RAZORPAY_KEY_ID);
console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);

// Razorpay Instance (Ensure .env is loaded)
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Razorpay credentials missing in .env");
    process.exit(1); // Exit if no credentials
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
app.use(express.static(path.join(__dirname, 'public')));


const p=path.join(__dirname,'./public');
console.log(p);

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./signin.html'));
    
});

app.get("/signin.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./main.html'));
});

app.get("/kitchen.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./kitchen.html'));
});

app.get("/cleaning.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./cleaning.html'));
});
app.get("/personalCare.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./personalCare.html'));
});

app.get("/skinCare.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./skinCare.html'));
});

app.get("/soapBar.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./soapBar.html'));
});

app.get("/community.html.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./community.html'));
});


app.get("/checkout.html",(req,res)=>{
    res.sendFile(path.join(__dirname,'./public','./checkout.html'));
});




//connection
mongoose
    .connect("mongodb://127.0.0.1:27017/wcEcommerce")
    .then(()=>console.log("MongoDb Connected"))
    .catch((err)=>console.log("Mongo Error".err));


//Middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(p));


//Schema
const LoginSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        
    },
    password:{
        type:String, 
        required:true,
    }

});

const feedbackSchema=new mongoose.Schema({
    feedback:{
        type:String,
    },
});


// Cart Schema

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user' // Reference to the User model
    },
    items: [
        {
            productName: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ]
});



//Checkout Schema
const checkoutSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    contactnum:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    billingAddress:{
        type:String,
        required:true,
    },
    packaging: {
        type: Number,
        required: true, // Since one option must be selected
    },
    shipping: {
        type: Number,
        required: true, // Since one option must be selected
    },
    orderDate: {
        type: Date,
        default: Date.now, // Automatically set to the current date
    }
});

//Create model
const User=mongoose.model("user",LoginSchema);  
const Feedback=mongoose.model("fdback",feedbackSchema);
const Cart = mongoose.model("Cart", cartSchema);
const checkout=mongoose.model("Checkout",checkoutSchema);

//New user Sign in
app.post("/signin",async(req,res)=>{
    const body=req.body;
   
    // data.push({...body,id:data.length+1});    //new entry is pushed in data list also id is incremented  by one as every new entry is added

    if(!body.email || !body.password){      //email ya password dala h ki nhi check karega
        return res.status(400).json({msg: "All fields are required!"});
    }

    const userData={      
        email:body.email,
        password:body.password,
        
    };


    //check if user already exists
    const existingUser=await User.findOne({email:userData.email});   //"User" model wala use kiya h
    if(existingUser){
        res.send("User already exists! Try using different mail Id")
    }else{

        //hash the passwords
        const saltRounds=10;    //Number of salt rounds for hashing passwords(kitna digits tak hash hona chayye)
        const hashedPassword=await bcrypt.hash(userData.password,saltRounds);
        userData.password=hashedPassword;


        const result=await User.create({       //"User" model wala use kiya h   //create adds the new entry into the database
            email:body.email,
            password:userData.password,
             
        });
        console.log("Result ",result);
        return res.sendFile(path.join(__dirname,'./public','./main.html'));         //new user after registering opens main website page
    }
   
    // return res.status(201).json({msg:"User added successfully!"});  //201:status code for creating user successfully
 
});

//User Login
app.post("/login",async(req,res)=>{
    try{
        const check=await User.findOne({email:req.body.email});     //vhecks if ur mail id same tho nhi w other users
        if(!check){
            res.send("User not found");

        }

        //compare the normal password from database with hashpassword
        const isPasswordMatch=await bcrypt.compare(req.body.password,check.password);
        if(isPasswordMatch){
            res.sendFile(path.join(__dirname,"./public","./main.html"));

        }else{
            res.send("Wrong password");
        }

    }catch{
        res.send("Wrong details");
    }

});

//feedback
app.post("/feedback", async (req, res) => {
    const { feedback } = req.body; // Expecting feedback as part of the request body

    try {
        const storeFeedback = await Feedback.create({ feedback });
        res.status(201).json(storeFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving feedback" });
    }
});


// Cart items
// Add an item to the cart
app.post("/checkout.html", async (req, res) => {
    console.log("Checkout request received:", req.body); // Debugging output

    try {
        // Destructure and validate request body fields
        const { name, contactnum, email, billingAddress, packaging, shipping, items, userId } = req.body;

        if (!name || !contactnum || !email || !billingAddress || !packaging || !shipping || !items || !userId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Create a new checkout entry
        const checkoutUser = await checkout.create({
            name,
            contactnum,
            email,
            billingAddress,
            packaging,
            shipping,
        });

        // Save the items to the cart collection associated with this checkout
        const cart = await Cart.create({
            userId,
            checkoutId: checkoutUser._id,
            items
        });

        console.log("Checkout and cart items saved successfully:", checkoutUser, cart);
        
        // Return a success response
        res.sendFile(path.join(__dirname, "./public", "./main.html"));
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).send("Error processing checkout: " + error.message);
    }
});



//After Filling checkout details
app.post("/checkout",async(req,res)=>{
    //  
    
    console.log("Checkout request received:", req.body); // Debugging output

    try {
        // Destructure and validate request body fields
        const { name, contactnum, email, billingAddress,  packaging,shipping} = req.body;

        if (!name || !contactnum || !email || !billingAddress|| !  packaging || !shipping ) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Create checkout entry in the database
        const checkoutUser = await checkout.create({
            name,
            contactnum,
            email,
            billingAddress,
            packaging,
            shipping,
            
        });
    
            console.log("Checkout successful:", checkoutUser);
            // return res.status(201).json({ message: "Order placed successfully!" });
            res.sendFile(path.join(__dirname,"./public","./main.html"));
    
        } catch (error) {
            console.error("Error during checkout:", error);
            res.status(500).send("Error processing checkout: " + error.message);
        }
});
    

// Get all cart items for a user
app.get("/cart/:userId", async (req, res) => {
    try {
        const cartItems = await Cart.find({ userId: req.params.userId });
        res.status(200).json(cartItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving cart items" });
    }
});

// Remove an item from the cart
app.delete("/cart/remove/:id", async (req, res) => {
    try {
        const cartItemId = req.params.id;
        await Cart.findByIdAndDelete(cartItemId);
        res.status(200).json({ message: "Cart item removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing cart item" });
    }
});

//Razor Pay
// Razorpay Payment Routes
app.post("/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency,
            receipt: "order_" + Date.now(),
        });
        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

app.post("/verify-payment", async (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(order_id + "|" + payment_id)
            .digest("hex");

        if (generated_signature === signature) {
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});


app.listen(port,()=>{console.log("Server running on port 3000...")});
