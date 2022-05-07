import { io } from 'socket.io-client';

export class Realtime {
  constructor ({
    protocol='ws',
    addr='127.0.0.1',
    port='3000',
    onData
  }) {
    this.socket = io(`${protocol}://${addr}:${port}`);

    this.socket.on('register', (name) => {
      console.log(`register ${name}`);
    });

    this.socket.on('unregister', (name) => {
      console.log(`unregister ${name}`);

    });

    this.socket.on('lidar-data', onData);
  }

  send (event, data) {
    this.socket.emit(event, data);
  }
}
