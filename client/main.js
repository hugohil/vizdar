import { io } from 'socket.io-client';

import setupGUI from './gui.js';
import Device from './Device';

const socket = io('http://127.0.0.1:3000');

const downscale = 4;

const canvas = document.createElement('canvas');
canvas.width = (window.innerWidth / downscale);
canvas.height = (window.innerHeight / downscale);
const context = canvas.getContext('2d');

const params = {
  threshold: 120,
  blobRadius: 50,
  exclusionZones: {},
};

const { pane, fpsGraph, preset } = setupGUI(params);

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

  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const name in devices) {
    if (!devices[name]) continue;
    devices[name].drawPointCloud(canvas, context);
  }

  for (const zone in params.exclusionZones) {
    const { pos, dim, debug } = params.exclusionZones[zone];
    context.fillStyle = 'black';
    context.fillRect(
      ((((pos.x + 1) * 0.5) - (dim.x * 0.5)) * canvas.width),
      ((((pos.y + 1) * 0.5) - (dim.y * 0.5)) * canvas.height),
      (dim.x * canvas.width),
      (dim.y * canvas.height)
    );
    if (debug) {
      context.strokeStyle = 'white';
      context.strokeRect(
        ((((pos.x + 1) * 0.5) - (dim.x * 0.5)) * canvas.width),
        ((((pos.y + 1) * 0.5) - (dim.y * 0.5)) * canvas.height),
        (dim.x * canvas.width),
        (dim.y * canvas.height)
      );
    }
  }

  process(context);

  blobs.forEach(b => {
    context.strokeStyle = 'green';
    context.lineWidth = 2;
    context.strokeRect(
      b.minx,
      b.miny,
      (b.maxx - b.minx),
      (b.maxy - b.miny),
    );
  });

  time++;
  fpsGraph.end();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

function dist (x1, y1, x2, y2) {
  const a = (x1 - x2);
  const b = (y1 - y2);

  return Math.sqrt((a * a) + (b * b));
};

let blobs = [];
class Blob {
  constructor (x, y) {
    this.minx = x;
    this.maxx = x;
    this.miny = y;
    this.maxy = y;
  }

  isNear (point) {
    const cx = ((this.minx + this.maxx) / 2);
    const cy = ((this.miny + this.maxy) / 2);

    return dist(cx, cy, point.x, point.y) <= params.blobRadius;
  }

  addPoint(point) {
    this.minx = Math.min(this.minx, point.x);
    this.maxx = Math.max(this.maxx, point.x);

    this.miny = Math.min(this.miny, point.y);
    this.maxy = Math.max(this.maxy, point.y);
  }
}

function process () {
  blobs = [];

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = imageData.data;

  for (let i = 0; i < rgba.length; i += 4) {
    const brightness = (0.34 * rgba[i]) + (0.5 * rgba[i + 1]) + (0.16 * rgba[i + 2]);

    if (brightness >= params.threshold) {
      const pos = {
        x: (i / 4) % canvas.width,
        y: Math.floor((i / 4) / canvas.width)
      };

      let found = false;

      for (let j = 0; j < blobs.length; j++) {
        const b = blobs[j];

        if (b.isNear(pos)) {
          found = true;
          b.addPoint(pos);
          break;
        }
      }

      if (!found) {
        let b = new Blob(pos.x, pos.y);
        blobs.push(b);
      }
      // const d = dist(coords.x, coords.y, mb.x, mb.y);
    }
  }
}

document.body.appendChild(canvas);

document.addEventListener('keypress', (e) => {
  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
  }
});
