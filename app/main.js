const socket = io();

let lidar = [];
socket.on('lidar-data', (d) => { lidar = d; });

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext('2d');

let lastStartingAngle = 0;
const render = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';

  // console.log(lidar[0]?.a);
  const diff = (lastStartingAngle - (lidar[0]?.a ?? 0));

  for (let i = (lidar.length - 1); i > 0 ; i--) {
    const { a, d } = lidar[i];
    const x = (d * Math.cos(a) / params.scale) + (canvas.width / 2);
    const y = (d * Math.sin(a) / params.scale) + (canvas.height / 2);

    lidar[i] && context.fillRect(x, y, 3, 3);
  }
  lastStartingAngle = lidar[0]?.a ?? 0;

  requestAnimationFrame(render);
}
render();

document.body.appendChild(canvas);

const pane = new Tweakpane.Pane();
const params = {
  scale: 10
}

pane.addInput(params, 'scale', { min: 1, max: 30 });

document.addEventListener('keypress', (e) => {
  if (e.key === 'g') {
    pane.hidden = !pane.hidden;
  } else if (e.key === 'l') {
    console.log(lidar);
  }
});
