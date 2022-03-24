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
      minDistance: 500,
      maxDistance: 2500,
      pointSize: 5,
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
    this.gui.addInput(this.params, 'minDistance', {
      min: 0,
      max: 10000,
      presetKey: `minDistance-${name}`
    });
    this.gui.addInput(this.params, 'maxDistance', {
      min: 0,
      max: 10000,
      presetKey: `maxDistance-${name}`
    });
    this.gui.addInput(this.params, 'pointSize', {
      min: 0,
      max: 20,
      presetKey: `pointSize-${name}`
    });
  }

  updateData (data) {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].d < this.params.minDistance || data[i].d > this.params.maxDistance) {
        data.splice(i, 1);
      }
    }
    this.data = data;
  }

  drawPointCloud (canvas, context) {
    const ps = this.params.pointSize;

    context.save();

    context.translate(
      (canvas.width / 2) + this.params.offsetX,
      (canvas.height / 2) + this.params.offsetY
    );
    context.rotate(d2r(this.params.rotation));

    context.fillStyle = 'red';
    context.fillRect(-5, -5, 10, 10);
    context.fillStyle = 'black';

    for (let i = (this.data.length - 1); i > 0 ; i--) {
      let { x, y } = this.data[i];

      x /= this.params.scale;
      y /= this.params.scale;

      context.fillRect((x - (ps * 0.5)), (y - (ps * 0.5)), ps, ps);
    }

    context.beginPath();
    context.arc(0, 0, (this.params.minDistance / this.params.scale), 0, 2 * Math.PI);
    context.closePath();
    context.stroke();

    context.beginPath();
    context.arc(0, 0, (this.params.maxDistance / this.params.scale), 0, 2 * Math.PI);
    context.closePath();
    context.stroke();

    context.restore();
  }

  close () {
    this.gui.dispose();
  }
}
