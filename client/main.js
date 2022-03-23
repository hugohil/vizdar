import { io } from 'socket.io-client';
const socket = io('http://127.0.0.1:3000');

import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

import * as gm from 'gammacv';

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const gmSession = new gm.Session();
const input = new gm.Tensor('uint8', [canvas.height, canvas.width, 4]);
const prevInput = new gm.Tensor('uint8', [canvas.height, canvas.width, 4]);
let pipeline = input
pipeline = gm.grayscale(pipeline);
// pipeline = gm.erode(pipeline, [8, 8]);
// pipeline = gm.dilate(pipeline, [8, 8]);
// pipeline = gm.adaptiveThreshold(pipeline);
// pipeline = gm.motionDetect(input, prevInput);
gmSession.init(pipeline);
const gmOutput = gm.tensorFrom(pipeline);

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

class Device {
  constructor (id) {
    this.data = [];

    this.params = {
      offsetX: 0,
      offsetY: 0,
      scale: 10,
      rotation: 0
    }

    this.gui = pane.addFolder({ title: `device ${id}` });
    this.gui.addInput(this.params, 'offsetX', {
      min: -(canvas.width / 2),
      max: (canvas.width / 2),
      presetKey: `offsetX-${id}`
    });
    this.gui.addInput(this.params, 'offsetY', {
      min: -(canvas.height / 2),
      max: (canvas.height / 2),
      presetKey: `offsetY-${id}`
    });
    this.gui.addInput(this.params, 'scale', {
      min: 1,
      max: 30,
      presetKey: `scale-${id}`
    });
    this.gui.addInput(this.params, 'rotation', {
      min: -360,
      max: 360,
      presetKey: `rotation-${id}`
    });
  }

  close () {
    this.gui.dispose();
  }
}

let lidar = {};
socket.on('register', (id) => {
  console.log(`register ${id}`);
  lidar[id] = new Device(id);
});
socket.on('unregister', (id) => {
  console.log(`unregister ${id}`);
  if (lidar[id]) {
    lidar[id].close();
    delete lidar[id];
  }
});
socket.on('lidar-data', ({ id, data }) => {
  if (!lidar[id]) {
    console.log(`register ${id}`);
    lidar[id] = new Device(id);
  }
  lidar[id].data = data;
});

function d2r (deg) {
  return deg * (Math.PI / 180);
}

let time = 0;
const render = function () {
  fpsGraph.begin();

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const id in lidar) {
    if (!lidar[id]) continue;

    context.save();
    context.translate(
      (canvas.width / 2) + lidar[id].params.offsetX,
      (canvas.height / 2) + lidar[id].params.offsetY
    );
    context.rotate(d2r(lidar[id].params.rotation));

    context.fillStyle = 'red';
    context.fillRect(0, 0, 10, 10);
    context.fillStyle = 'black';

    for (let i = (lidar[id].data.length - 1); i > 0 ; i--) {
      let { x, y } = lidar[id].data[i];

      x /= lidar[id].params.scale;
      y /= lidar[id].params.scale;

      context.fillRect(x, y, 3, 3);
    }
    context.restore();
  }

  // const imgData = context.getImageData(0, 0, input.shape[1], input.shape[0]);
  // input.assign(new Uint8Array(imgData.data));

  // context.clearRect(0, 0, canvas.width, canvas.height);
  // context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  // context.fillRect(0, 0, canvas.width, canvas.height);

  // gmSession.runOp(pipeline, time, gmOutput);
  // gm.canvasFromTensor(canvas, gmOutput);

  // prevInput.assign(new Uint8Array(imgData.data));

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
