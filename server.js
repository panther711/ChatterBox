const express = require("express");
require("dotenv").config();
require("./db/conn");
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 5000;

// <--------------common middlewares--------------------->

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// <--------------error handling middleware-------------->

app.use((err, req, res, next) => {
  const errStatus = err.status || 500;
  const errMsg = err.message || "Something went wrong";
  return res.status(errStatus).send({
    success: false,
    stack: err.stack,
    message: errMsg,
    status: errStatus,
  });
});

// <--------------socket.io server----------------------->

const server = app.listen(port, () => {});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (id) => {
    socket.join(id);
  });

  socket.on("join-chat", (chatid) => {
    socket.join(chatid);
  });

  socket.on("new-message", (newMessage) => {
    newMessage.currentChat.users.forEach((user) => {
      if (user === newMessage.data.senderId) return;
      socket.to(user).emit("message-recieved", newMessage);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});
