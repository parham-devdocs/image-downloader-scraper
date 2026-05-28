import mongoose from "mongoose";
import { Message, User } from "../types";

const messageSchema = new mongoose.Schema<Message>({

   
sender:{
    type:mongoose.Types.ObjectId,
    required:true,
    ref:"User"
},
content:{
    type:String,
    required:true
},


seen:{
    type:Boolean,
    required:true,
    default:false

},

},{timestamps:true});

export const MessageModel = mongoose.model("Message", messageSchema);
