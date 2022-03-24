function d2r (deg) {
  return deg * (Math.PI / 180);
}

function lerp (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
}

export default class Device {
  constructor ({ name, canvas, pane }) {
    this.data = [];

    this.params = {
      offsetX: 0,
      offsetY: 0,
      scale: 10,
      rotation: 0,
      smoothing: 1
    }

    this.gui = pane.addFolder({ title: `device ${name}` });
    this.gui.addInput(this.params, 'offsetX', {
      min: -(canvas.width / 2),
      max: (canvas.width / 2),
      presetKey: `offsetX-${name}`
    });
    this.gui.addInput(this.params, 'offsetY', {
      min: -(canvas.height / 2),
      max: (canvas.height / 2),
      presetKey: `offsetY-${name}`
    });
    this.gui.addInput(this.params, 'scale', {
      min: 1,
      max: 30,
      presetKey: `scale-${name}`
    });
    this.gui.addInput(this.params, 'rotation', {
      min: -360,
      max: 360,
      presetKey: `rotation-${name}`
    });
    this.gui.addInput(this.params, 'smoothing', {
      min: 0,
      max: 3,
      step: 0.1,
      presetKey: `smoothing-${name}`
    });
  }

  updateData (data) {
    // todo: smooth datas
    this.data = data;
  }

  drawPointCloud (canvas, context) {
    context.save();

    context.translate(
      (canvas.width / 2) + this.params.offsetX,
      (canvas.height / 2) + this.params.offsetY
    );
    context.rotate(d2r(this.params.rotation));

    context.fillStyle = 'red';
    context.fillRect(0, 0, 10, 10);
    context.fillStyle = 'black';

    for (let i = (this.data.length - 1); i > 0 ; i--) {
      let { x, y } = this.data[i];

      x /= this.params.scale;
      y /= this.params.scale;

      context.fillRect(x, y, 3, 3);
    }
    context.restore();
  }

  close () {
    this.gui.dispose();
  }
}
