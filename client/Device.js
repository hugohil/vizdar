function d2r (deg) {
  return deg * (Math.PI / 180);
}

export default class Device {
  constructor ({ id, canvas, pane }) {
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
