// require models
const mongoose = require('mongoose');
// Defind the note's database schema
const noteSchema = new mongoose.Schema({
    content :{
        type : String,
        required: true
    },
    author:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
        required :true
    },
    favoriteCount : {
        type: Number,
        default: 0

    },
    favoriteBy :[{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]

},{
    // Assigns createdAt and updatedAt fields with a Date type
    timestamps : true
});

// Define the 'note' module with schema
const  Note = mongoose.model('Note',noteSchema);
// Export the module
module.exports = Note;