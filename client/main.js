import { dist } from './utils';

import realtime from './realtime.js';
import setupGUI from './gui.js';
import Blob from './Blob';

const downscale = 4;
const canvas = document.createElement('canvas');
canvas.width = (window.innerWidth / downscale);
canvas.height = (window.innerHeight / downscale);
const context = canvas.getContext('2d');

const params = {
  brightness: 120,
  distance: 50,
  lifespan: 2.5,
  exclusionZones: {},
};

const { pane, fpsGraph, preset } = setupGUI(params);

let devices = {};

const socket = realtime.create({ devices, canvas, pane });

let time = 0;
const render = function () {
  fpsGraph.begin();

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(0, 0, 0, 1)';
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
    if (b.size() > 250) {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.strokeRect(
        b.minx,
        b.miny,
        (b.maxx - b.minx),
        (b.maxy - b.miny),
      );
    }
  });
  socket.emit('send-positions', blobs);

  for (const name in devices) {
    if (!devices[name]) continue;
    devices[name].params.debug && devices[name].drawDebug(canvas, context);
  }

  time++;
  fpsGraph.end();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

let blobs = [];
let blobsInstant = [];

function doBlobSnapshot (pos) {
  let found = false;

  for (let j = 0; j < blobsInstant.length; j++) {
    const b = blobsInstant[j];

    if (b.isNear(pos, params.distance)) {
      found = true;
      b.addPoint(pos);
      break;
    }
  }

  if (!found) {
    let b = new Blob(pos.x, pos.y);
    blobsInstant.push(b);
  }

  blobs = blobsInstant;
}

function process () {
  blobs = [];
  blobsInstant = [];

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = imageData.data;

  for (let i = 0; i < rgba.length; i += 4) {
    const brightness = (0.34 * rgba[i]) + (0.5 * rgba[i + 1]) + (0.16 * rgba[i + 2]);

    if (brightness >= params.brightness) {
      const pos = {
        x: (i / 4) % canvas.width,
        y: Math.floor((i / 4) / canvas.width)
      };
      doBlobSnapshot(pos);
    }
  }
}

document.body.appendChild(canvas);

document.addEventListener('keypress', (e) => {
  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
  }
});
