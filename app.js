const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");


const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,("/public"))));

app.get("/",(req,res)=>{
    res.send("Hii I'm root... ");
});

const validateListing=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }
}

// Index Route 
app.get("/listings",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

// New Route 
app.get("/listings/new",async (req,res)=>{
    res.render("listings/new.ejs");
});

// Show Route 
app.get("/listing/:id",wrapAsync (async (req,res)=>{
    let {id} =req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{ listing });
}))

// Create Route 
app.post("/listings",validateListing,
    wrapAsync (async (req,res,next) =>{
    //    if(!req.body.listing){
    //     throw new ExpressError(400,"Send Valid Data for listings.");
    //    }
    //     const newListing=new Listing (req.body.listing);
    //     if(!newListing.title){
    //         throw new ExpressError(400,"Description is missing!");
    //     }
    //     if(!newListing.price){
    //         throw new ExpressError(400,"Price is missing!");
    //     }
    //     if(!newListing.country){
    //         throw new ExpressError(400,"Country is missing!");
    //     }
    //     if(!newListing.location){
    //         throw new ExpressError(400,"Location is missing!");
    //     }
        const newListing=new Listing (req.body.listing);
        await newListing.save();
        res.redirect("/listings");  
}));

// Edit Route 
app.get("/listings/:id/edit",wrapAsync (async (req,res)=>{
    let {id} =req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update Route 
app.put("/listings/:id",validateListing,
    wrapAsync (async (req,res)=>{
    let {id} =req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

// Delete Route 

app.delete("/listings/:id",wrapAsync (async (req,res)=>{
    let {id} =req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));

// app.get("/testListing",async (req,res)=>{
//     let sampleListing= new Listing({
//         title:"Hotel Siba",
//         description:"Double bed available",
//         price:1200,
//         location:"Satara",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved..");
//     res.send("Sample test Successfull...");
// });

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!!!"));
// });

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404,"Page Not Found"));
  });


app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something Went Wrong!"}=err;
    res.status(statusCode).render("err.ejs",{ message });
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("App is Listening to posrt 8080...");
});