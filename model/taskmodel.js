const mongoose=require("mongoose")
const task=mongoose.Schema({
    task:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
     Image:{
        type:String,
        required:false
    },
    assign_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    assign_to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
  
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
    
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
})
module.exports=mongoose.model("task",task);
