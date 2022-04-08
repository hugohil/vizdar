import { io } from 'socket.io-client';

import Device from './Device';

export default {
  create ({ devices, canvas, pane }) {
    const socket = io('http://127.0.0.1:3000');

    socket.on('register', (name) => {
      console.log(`register ${name}`);
      devices[name] = new Device({name, canvas, pane});
      try { pane.importPreset(JSON.parse(preset)); } catch (ignore) {}
    });
    socket.on('unregister', (name) => {
      console.log(`unregister ${name}`);
      if (devices[name]) {
        devices[name].close();
        delete devices[name];
      }
    });
    socket.on('lidar-data', ({ name, data }) => {
      if (!devices[name]) {
        console.log(`register ${name}`);
        devices[name] = new Device({name, canvas, pane});
        try { pane.importPreset(JSON.parse(preset)); } catch (ignore) {}
      }
      devices[name].updateData(data);
    });

    return socket;
  }
}
