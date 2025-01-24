const express = require("express") ;
const mongoose = require("mongoose") ;
const path = require("path");
const blogRoute = require("./routes/blog");
const userRoute = require("./routes/user");
const cookieParser = require("cookie-parser");
const {checkForAuthentication} = require("./middlewares/authentication");
const Blog = require("./models/blog");
const app = express() ;
const PORT = 8000 ;


app.set("view engine","ejs");
app.set("views",path.resolve('./views'));

//midllewares
app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());
app.use(checkForAuthentication("token"));
app.use(express.static(path.resolve("./public")));

mongoose.connect("mongodb://127.0.0.1:27017/blogify")
.then((e) => {console.log(`MONGODB Connected`)});

app.get('/', async (req,res) => {
    const allBlogs =  await Blog.find({});
    return res.render("home",{
        user:req.user|| null ,
        blogs : allBlogs ,
    });
});

app.use("/user",userRoute);
app.use("/blog",blogRoute);

app.listen(PORT , ()=>{console.log(`Server Created at Port ${PORT}`)});

