import { dist } from './utils';

import { Realtime } from './Realtime';
import setupGUI from './gui';
import Blob from './Blob';
import Zone from './Zone';

const downscale = 4;
const canvas = document.createElement('canvas');
canvas.width = (window.innerWidth / downscale);
canvas.height = (window.innerHeight / downscale);
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
document.querySelector('.main').appendChild(canvas);

const params = {
  brightness: 120,
  distance: 12,
  minSize: 250,
  activeZone: new Zone((canvas.width / 2), (canvas.height / 2), 100, 100),
  // exclusionZones: {},
};

const { pane, devicesFolder, fpsGraph, preset } = setupGUI(params, canvas);

let devices = {};

const realtime = new Realtime({ devices, canvas, pane, preset, devicesFolder });

function drawZone ({x, y, width, height}, type) {
  context.strokeStyle = (type === 'exclusion') ? 'green' : 'orange';
  context.strokeRect(
    x - (width * 0.5),
    y - (height * 0.5),
    width,
    height
  );
}

const render = function () {
  fpsGraph.begin();

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(0, 0, 0, 1)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const name in devices) {
    if (!devices[name]) continue;
    devices[name].drawPointCloud(canvas, context);
  }

  process(context);
  realtime.send('blobs', getNormBlobs());

  blobs.forEach(b => {
    if (b.getSize() > 250) {
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.strokeRect(
        b.minx,
        b.miny,
        (b.maxx - b.minx),
        (b.maxy - b.miny),
      );
      context.fillStyle = 'green';
      context.fillText(b.id, b.minx, (b.miny - 3));
    }
  });

  for (const name in devices) {
    if (!devices[name]) continue;
    devices[name].params.debug && devices[name].drawDebug(canvas, context);
  }

  drawZone(params.activeZone, 'active');

  fpsGraph.end();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

let blobs = [];
function doBlobSnapshot (pos) {
  let found = false;
  let blobsInstant = [];

  for (let j = 0; j < blobs.length; j++) {
    const b = blobs[j];

    if (b.isNear(pos, params.distance)) {
      found = true;
      b.addPoint(pos);
      break;
    }
  }

  if (!found) {
    const b = new Blob(pos.x, pos.y, blobs.length);
    blobsInstant.push(b);
  }

  blobsInstant.forEach(b => {
    blobs.push(b);
  });
}

function process () {
  // if (realtime.dataIn) {
  //   for (let i = 0; i < blobs.length; i++) {
  //     blobs[i].alive = false;
  //   }
  // }
  blobs = [];

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = imageData.data;

  for (let i = 0; i < rgba.length; i += 4) {
    const brightness = (0.34 * rgba[i]) + (0.5 * rgba[i + 1]) + (0.16 * rgba[i + 2]);

    if (brightness >= params.brightness) {
      const pos = {
        x: (i / 4) % canvas.width,
        y: Math.floor((i / 4) / canvas.width)
      };
      if (params.activeZone.isInside(pos)) {
        doBlobSnapshot(pos);
      }
    }
  }

  // for (let i = (blobs.length - 1); i >= 0; i--) {
  //   if (!blobs[i].alive) {
  //     blobs.splice(i, 1);
  //   }
  // }
  // realtime.dataIn = false;
}

function getNormBlobs () {
  return blobs
    .filter(b => b.getSize() > params.minSize)
    .map(b => params.activeZone.getNormPosInside(b.center));
}

document.addEventListener('keypress', (e) => {
  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
  } else if (e.key === 'b') {
    console.log(getNormBlobs());
  }
});
