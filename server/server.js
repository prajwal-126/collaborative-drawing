import express from "express";
import http from "http";
import cors from 'cors';
import { Server } from "socket.io";
import { createRoom } from "./rooms.js";

import path from "path";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(process.cwd(), "server/dist")));

app.use((req, res) => {
  res.sendFile(
    path.join(process.cwd(), "server/dist/index.html")
  );
});



io.on("connection", (socket) => {
  const roomId = "global";
  const room = createRoom(roomId);

  socket.join(roomId);
  socket.emit("init_state", room.strokes);

  socket.on("draw", (stroke) => {
    room.strokes.push(stroke);
    socket.to(roomId).emit("draw", stroke);
  });

  socket.on("cursor", (cursor) => {
    socket.to(roomId).emit("cursor", {
      id: socket.id,
      ...cursor
    });
  });

  socket.on("undo", () => {
    room.removeLastStrokeByUser(socket.id);
    io.to(roomId).emit("replay", room.strokes);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
