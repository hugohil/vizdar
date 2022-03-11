import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

app.use(express.static('app'));

io.on("connection", (socket) => {
  const { id } = socket;
  console.log('socket connected.', id);

  socket.on('data', (data) => {
    socket.broadcast.emit('lidar-data', { id, data });
  });
});
httpServer.listen(3000);