import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

app.use(express.static('app'));

io.on("connection", (socket) => {
  console.log('socket connected.', socket.id);

  socket.on('data', (data) => {
    socket.broadcast.emit('lidar-data', data);
  });
});
httpServer.listen(3000);