const {Schema,model} = require('mongoose');
const {createHmac,randomBytes} = require("crypto");
const { createTokenForUser } = require("../services/authentication");


const userSchema = new Schema({
    fullName: {
        type : String ,
       
    },
    email:{
        type : String ,
        required : true ,
        unique : true ,
    },
    salt:{
        type : String ,
    },
    password :{
        type : String ,
        required : true ,
       
    },
    profileImageURL : {
        type : String ,
        default : '/images/download.png'
    },
    role:{
        type:String,
        enum : [ "USER" , "ADMIN"],
        default : "USER"
    }
},{ timestamps : true });

userSchema.pre("save", function (next) {
    const user = this ;
    if(!user.isModified("password"))  return ;
    const salt = randomBytes(16).toString('hex') ;

    const hashedPassword = createHmac('sha256',salt).update(user.password).digest('hex') ;

    this.salt = salt ;
    this.password = hashedPassword ;
    next();
});

userSchema.static("matchPasswordAndGenerateToken", async function(email,password){
    const user = await this.findOne({email}) ;
    if(!user) throw new Error("User Not Found");

    const salt = user.salt ;
    const hashedPassword = user.password ;
    const userProvideHash = createHmac('sha256',salt).update(password).digest('hex') ;
    if(hashedPassword !== userProvideHash) throw new Error("Password Incorrect");

    const token = createTokenForUser(user);
    return  token ;
    
});

const user = model("user",userSchema);

module.exports = user ;













