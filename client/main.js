import { io } from 'socket.io-client';

import Device from './Device';

const socket = io('http://127.0.0.1:3000');

import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

const canvas = document.createElement('canvas');
canvas.width = (window.innerWidth / 3);
canvas.height = (window.innerHeight / 3);
const context = canvas.getContext('2d');

const pane = new Pane({ title: 'opts' });
pane.registerPlugin(EssentialsPlugin);

let preset = localStorage.getItem('preset');
try {
  pane.importPreset(JSON.parse(preset));
} catch (ignore) {}

const saveButton = pane.addButton({ title: 'Save'}).on('click', () => {
  preset = pane.exportPreset();
  localStorage.setItem('preset', JSON.stringify(preset));
});

const fpsGraph = pane.addBlade({
  view: 'fpsgraph',
  label: 'fpsgraph',
  lineCount: 2,
});

const params = {
  exclusionZones: {},
};

pane.addButton({ title: 'add exclusion zone' }).on('click', () => {
  const index = Object.keys(params.exclusionZones).length;
  const folder = pane.addFolder({ title: `exclusion zone ${index + 1}` });
  params.exclusionZones[`zone-${index}`] = {
    pos: { x: 0, y: 0 },
    dim: { x: 0.1, y: 0.1 },
    debug: true,
  };
  folder.addInput(params.exclusionZones[`zone-${index}`], 'pos', {
    x: { min: -1, max: 1, step: 0.01 },
    y: { min: -1, max: 1, step: 0.01 },
  });
  folder.addInput(params.exclusionZones[`zone-${index}`], 'dim', {
    x: { min: 0, max: 1, step: 0.01 },
    y: { min: 0, max: 1, step: 0.01 },
  });
  folder.addInput(params.exclusionZones[`zone-${index}`], 'debug');
  folder.addButton({ title: 'remove' }).on('click', () => {
    delete params.exclusionZones[`zone-${index}`];
    folder.dispose();
  });
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
  context.fillStyle = 'rgba(255, 255, 255, 0.15)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const name in devices) {
    if (!devices[name]) continue;
    devices[name].drawPointCloud(canvas, context);
  }

  for (const zone in params.exclusionZones) {
    const { pos, dim, debug } = params.exclusionZones[zone];
    context.fillStyle = 'white';
    context.fillRect(
      ((((pos.x + 1) * 0.5) - (dim.x * 0.5)) * canvas.width),
      ((((pos.y + 1) * 0.5) - (dim.y * 0.5)) * canvas.height),
      (dim.x * canvas.width),
      (dim.y * canvas.height)
    );
    if (debug) {
      context.strokeRect(
        ((((pos.x + 1) * 0.5) - (dim.x * 0.5)) * canvas.width),
        ((((pos.y + 1) * 0.5) - (dim.y * 0.5)) * canvas.height),
        (dim.x * canvas.width),
        (dim.y * canvas.height)
      );
    }
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
