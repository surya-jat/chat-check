// Jai Shree Ram
// Node server which will handle socket io connections
// I have taken 50 port for client and 8000 port for server
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");
const app = express();
const mongoose = require("mongoose");


main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/irp");
  console.log("we have been connected with irp db");
}
const loginSchema = new mongoose.Schema({
  username: String,
  password: String,
  confpassword: String,
});
const kitten = mongoose.model("irpchat", loginSchema);

app.use(cors());
// const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "static/pug"));
// app.use(cors());
app.use("/static", express.static("static"));
app.use(express.urlencoded());
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    // origin: 'http://10.7.25.100',
    origin: 'https://chat-check-tt5h.onrender.com/',
    //  credentials: true,
    methods: ["GET", "POST"],
  }
});

app.get("/", (req, res) => {
  res.status(200).render("home.pug");
});
// app.get("/", (req, res) => {
//   res.status(200).render("guest.pug");
// });



app.post("/guest", (req, res) => {
    const guestName = new kitten(req.body);
    guestName.save();
    res.status(200).render('home.pug');
}
);

app.get("/signup", (req, res) => {
  res.status(200).render("signup.pug");
});
app.post("/signup", (req, res) => {
  const userData = new kitten(req.body);
  userData.save();
  res.status(200).render("login.pug");
});
app.get("/login", (req, res) => {
    res.status(200).render("login.pug");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  kitten
    .find({ username: username })
    .then((chatapp) => {
      if (
        chatapp[0].password === password &&
        chatapp[0].username === username
      ) {
        res.status(200).render("home.pug");
      } else {
        res.send("Invalid credentials");
      }
    })
    .catch((err) => console.log(err));
});

const users = {};
// io.on --> It will handle all the users(or we can say it will handle the whole connection)
io.on("connection", (socket) => {
  // When someone left the chat
  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
  });
  // This socket.on give a message to other users that someone joined the chat
  socket.on("new-user-joined", (name) => {
    // We will store the name into user with a unique id
    users[socket.id] = name;
    // broadkast.emit --> It will send a message that 'name' joined the chat
    socket.broadcast.emit("user-joined", name);
  });

  // Now if a user send a message then we have to handel that message and pass it to other users
  socket.on("send", (message) => {
    socket.broadcast.emit("recieve", {
      message: message,
      name: users[socket.id],
    });
  });
});

server.listen(5001, () => {
  console.log("Server is running on port 5001");
});
