import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

app.use(express.static('app'));

io.on('connection', (socket) => {
  const { id } = socket;
  console.log('socket connected.', id);

  const name = socket.handshake.query.name;
  if (name) {
    console.log('lidar registered:', name);

    socket.broadcast.emit('register', name);

    socket.on('disconnect', () => {
      console.log('socket disconnected.', name);
      socket.broadcast.emit('unregister', name);
    });

    socket.on('data', (data) => {
      socket.broadcast.emit('lidar-data', { name, data });
    });
  }
});
httpServer.listen(3000);
console.log('listening on http://127.0.0.1:3000');
