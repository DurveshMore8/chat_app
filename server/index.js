import express, { json } from "express";
import { connect, Schema, model } from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { configDotenv } from "dotenv";
import router from "./routes.js";
import { Message } from "./schema.js";
configDotenv();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(json());
app.use(router);

// MongoDB connection
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", async (data) => {
    const message = new Message(data);
    console.log(message);
    await message.save();
    io.emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
