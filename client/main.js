'use strict'

import p5 from 'p5';
import { Realtime } from './Realtime';

let canvas = null;

const scale = 10;

const Sketch = (s) => {
  s.setup = () => {
    canvas = s.createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent = document.querySelector('.main');
    s.data = [];

    s.noCursor();
  }

  s.draw = () => {
    const { width, height } = s;

    s.background(255);

    s.stroke(220);
    s.strokeWeight(1);

    const unit = (width / 4 / scale);
    for (var x = 0; x < width; x += unit) {
      for (var y = 0; y < height; y += unit) {
        s.line(x, 0, x, height);
        s.line(0, y, width, y);
      }
    }

    s.push();
    s.translate((width / 2), (height / 2));
    s.noFill();
    s.stroke(0);
    s.strokeWeight(3);

    for (let i = (s.data.length - 1); i > 0 ; i--) {
      let { x, y } = s.data[i];

      x /= scale;
      y /= scale;

      s.point(x, y);
    }
    s.pop();

    s.noStroke();
    s.fill(0);
    s.ellipse(s.mouseX, s.mouseY, 10, 10);
  }

  s.onData = (name, d) => {
    s.data = d;
  }
}

const sketch = new p5(Sketch);

const realtime = new Realtime({
  onData: ({ name, data }) => {
    sketch.onData(name, data);
  }
});
