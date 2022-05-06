import { dist, pointDist, isNear, getClosest } from './utils';

import { Realtime } from './Realtime';
import setupGUI from './gui';
import Blob from './Blob';
import Zone from './Zone';

const downscale = 3;
const canvas = document.createElement('canvas');
canvas.width = (window.innerWidth / downscale);
canvas.height = (window.innerHeight / downscale);
const context = canvas.getContext('2d');
context.font = '12px monospace';
document.querySelector('.main').appendChild(canvas);

const params = {
  brightness: 120,
  minSize: 200,
  distance: 50,
  lifespan: 2.5,
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

  process(context);
  realtime.send('blobs', getNormBlobs());

  blobs.forEach(b => {
    context.strokeStyle = 'green';
    context.lineWidth = 2;
    const pos = b.getCenter();

    // const dim = params.distance;
    // context.strokeRect(pos.x - (dim / 2), pos.y - (dim / 2), dim, dim);
    const dim = b.getDimensions();
    context.strokeRect(pos.x - (dim.x / 2), pos.y - (dim.y / 2), dim.x, dim.y);
    context.fillStyle = 'green';
    context.fillText(b.id, pos.x, pos.y);
  });

  for (const name in devices) {
    if (!devices[name]) continue;
    devices[name].params.debug && devices[name].drawDebug(canvas, context);
  }

  // drawZone(params.activeZone, 'active');

  time++;
  fpsGraph.end();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

let blobs = [];
let blobCount = 0;

function process () {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = imageData.data;

  let points = [];
  for (let i = 0; i < rgba.length; i += 4) {
    const brightness = (0.34 * rgba[i]) + (0.5 * rgba[i + 1]) + (0.16 * rgba[i + 2]);

    if (brightness >= params.brightness) {
      const pos = {
        x: (i / 4) % canvas.width,
        y: Math.floor((i / 4) / canvas.width)
      };
      points.push(pos);
    }
  }
  doBlobSnapshot(points);
}

function doBlobSnapshot (points) {
  let blobsInstant = [];

  for (let i = points.length - 1; i >= 0; i--) {
    let found = false;
    const pos = points[i];
    for (let j = 0; j < blobsInstant.length; j++) {
      const b = blobsInstant[j];

      if (b.isNear(pos, params.distance)) {
        found = true;
        b.addPoint(pos);
        break;
      }
    }

    if (!found) {
      let b = new Blob(pos.x, pos.y, 0, params.lifespan);
      blobsInstant.push(b);
    }
  }

  if (blobs.length < 1) {
    blobsInstant.forEach(bi => {
      const b = new Blob();
      b.clone(bi);
      // if (b.getSize() > (params.minSize * params.minSize)) {
        b.id = blobCount++;
        blobs.push(b);
      // }
    });
  // } else if (blobs.length <= blobsInstant.length) {
  } else {
    blobs.forEach(b => {
      let bestDistance = 10000;
      let match = null;

      blobsInstant.forEach(bi => {
        const distance = pointDist(b.getCenter(), bi.getCenter());
        if ((distance < bestDistance) && !bi.matched) {
          bestDistance = distance;
          bi.matched = true;
          match = bi;
        }
      });

      if (match) {
        b.mergeBlob(match);
      }

    });

    blobsInstant.forEach((bi, i) => {
      if (!bi.matched) {
        const b = new Blob();
        b.clone(bi);
        // if (b.getSize() > params.minSize) {
          b.id = blobCount++;
          blobs.push(b);
        // }
      } else {
        // blobs.splice(i, 1);
      }
    });
  }
}

function getNormBlobs () {
  return blobs.map(b => params.activeZone.getNormPosInside(b.getCenter()));
}

document.addEventListener('keypress', (e) => {
  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
  } else if (e.key === 'b') {
    console.log(getNormBlobs());
  }
});
