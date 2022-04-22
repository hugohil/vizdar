import { io } from 'socket.io-client';

import Device from './Device';

export class Realtime {
  constructor ({
    protocol='ws',
    addr='127.0.0.1',
    port='3000',
    devices,
    canvas,
    pane,
    preset,
    devicesFolder
  }) {
    this.socket = io(`${protocol}://${addr}:${port}`);

    this.socket.on('register', (name) => {
      console.log(`register ${name}`);
      if (devices[name]) {
        devices[name].close();
        delete devices[name];
      }
      devices[name] = new Device({name, canvas, devicesFolder});
      try { pane.importPreset(JSON.parse(preset)); } catch (ignore) {}
    });

    this.socket.on('unregister', (name) => {
      console.log(`unregister ${name}`);
      if (devices[name]) {
        devices[name].close();
        delete devices[name];
      }
    });

    this.socket.on('lidar-data', ({ name, data }) => {
      if (!devices[name]) {
        console.log(`register ${name}`);
        devices[name] = new Device({name, canvas, devicesFolder});
        try { pane.importPreset(JSON.parse(preset)); } catch (ignore) {}
      }
      devices[name].updateData(data);
    });
  }

  send (event, data) {
    this.socket.emit(event, data);
  }
}
