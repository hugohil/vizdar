import { io } from 'socket.io-client';

import Device from './Device';

const socket = io('http://127.0.0.1:3000');

import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const pane = new Pane({ title: 'opts' });
pane.registerPlugin(EssentialsPlugin);
const fpsGraph = pane.addBlade({
  view: 'fpsgraph',
  label: 'fpsgraph',
  lineCount: 2,
});

let preset = localStorage.getItem('preset');
try {
  pane.importPreset(JSON.parse(preset));
} catch (ignore) {}

const saveButton = pane.addButton({ title: 'Save'}).on('click', () => {
  preset = pane.exportPreset();
  localStorage.setItem('preset', JSON.stringify(preset));
});

let devices = {};
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

let time = 0;
const render = function () {
  fpsGraph.begin();

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const name in devices) {
    if (!devices[name]) continue;
    devices[name].drawPointCloud(canvas, context);
  }

  time++;
  fpsGraph.end();
  requestAnimationFrame(render);
}
render();

document.body.appendChild(canvas);

document.addEventListener('keypress', (e) => {
  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
  } else if (e.key === 'l') {
    console.log(lidar);
  }
});
