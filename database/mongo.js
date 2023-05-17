const mongoose = require("mongoose")
const Room = require("./Schema")
mongoose.connect("mongodb://localhost/testdb", () => {
    console.log("Database connected")
},
    e => console.log(e)
)

run()

update(1, "Bad Trip")

async function update(id, newMessage){
    const filter = {roomID: id};
    await Room.findOneAndUpdate({filter}, {$push: {message: newMessage}}, {new:true})
}

async function run() {
    const room = new Room({roomID: 1, message: ["Hello"]})
    await room.save()
    console.log(room)
}

