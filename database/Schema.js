const mongoose = require("mongoose")
const roomSchema =  new mongoose.Schema({
    roomID: String,
    message: [String]
})

module.exports = mongoose.model("rooms" , roomSchema)