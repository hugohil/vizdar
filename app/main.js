const socket = io();

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

const pane = new Tweakpane.Pane({ title: 'opts' });
const params = {
  offsetX: 0,
  offsetY: 0,
  scale: 10,
  rotation: 0
}

pane.addInput(params, 'offsetX', { min: -(canvas.width / 2), max: (canvas.width / 2) });
pane.addInput(params, 'offsetY', { min: -(canvas.height / 2), max: (canvas.height / 2) });
pane.addInput(params, 'scale', { min: 1, max: 30 });
pane.addInput(params, 'rotation', { min:-360, max: 360 });
const saveButton = pane.addButton({ title: 'Save'}).on('click', () => {
  preset = pane.exportPreset();
  localStorage.setItem('preset', JSON.stringify(preset));
});

let preset = localStorage.getItem('preset');
try {
  pane.importPreset(JSON.parse(preset));
} catch (ignore) {}

let lidar = {};
socket.on('lidar-data', ({ id, data }) => {
  lidar[id] = data;
});

function d2r (deg) {
  return deg * (Math.PI / 180);
}

const render = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (const id in lidar) {
    context.save();
    context.translate(
      (canvas.width / 2) + params.offsetX,
      (canvas.height / 2) + params.offsetY
    );
    context.rotate(d2r(params.rotation));

    context.fillStyle = 'red';
    context.fillRect(0, 0, 10, 10);
    context.fillStyle = 'black';

    for (let i = (lidar[id].length - 1); i > 0 ; i--) {
      let { x, y } = lidar[id][i];

      x /= params.scale;
      y /= params.scale;

      context.fillRect(x, y, 3, 3);
    }
    context.restore();
  }

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
