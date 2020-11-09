const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { getMessages } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersByRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "/index.html"));
});
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "/chat.html"));
});

io.on("connection", (socket) => {
  console.log(`new web socket connection`);

  socket.on("join", ({ username, room }, cb) => {
    const user = addUser(socket.id, username, room);

    if (user.error) {
      return cb(user.error);
    }

    socket.join(room);

    socket.emit("message", getMessages("Admin", "welcome to the server"));

    socket.broadcast
      .to(user.room)
      .emit("message", getMessages("Admin", `${user.username} has joined`));
    cb();

    io.to(user.room).emit("listUser", {
      room: user.room,
      users: getUsersByRoom(user.room),
    });
  });

  socket.on("sendmsg", (msg, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", getMessages(user.username, msg));
    cb();
  });

  socket.on("sendLocation", (coords, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMsg",
      getMessages(
        user.username,
        `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        getMessages("Admin", `${user.username} left the chat`)
      );
      io.to(user.room).emit("listUser", {
        room: user.room,
        users: getUsersByRoom(user.room),
      });
    }
  });
});

server.listen(port, () => `server running on port ${port}`);
