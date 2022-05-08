'use strict'

import './vendors/jsfeat-min'

import p5 from 'p5';
import { Realtime } from './Realtime';

let canvas = null;

const downscale = 2;
const scale = 10;
let previousPixels = null

const Sketch = (s) => {
  s.setup = () => {
    canvas = s.createCanvas(Math.round(window.innerWidth / downscale), Math.round(window.innerHeight / downscale));
    canvas.parent = document.querySelector('.main');

    s.data = [];

    s.noCursor();
  }

  s.draw = () => {
    const { width, height } = s;
    s.background(0);

    // draw point cloud
    s.push();
    s.translate((width / 2), (height / 2));
    s.noFill();
    s.stroke(255);
    s.strokeWeight(3);

    for (let i = (s.data.length - 1); i > 0 ; i--) {
      let { x, y } = s.data[i];

      x /= scale;
      y /= scale;

      s.point(x, y);
    }
    s.pop();

    // s.drawPointCloud();

    // // draw grid
    // s.stroke(30);
    // s.strokeWeight(1);
    // const unit = (width / 4 / scale);
    // for (let x = 0; x < width; x += unit) {
    //   for (let y = 0; y < height; y += unit) {
    //     s.line(x, 0, x, height);
    //     s.line(0, y, width, y);
    //   }
    // }

    // draw cursor
    s.noStroke();
    s.fill(255);
    s.ellipse(s.mouseX, s.mouseY, 10, 10);
  }

  s.drawPointCloud = () => {
    const { width, height } = s;

    // s.filter(s.BLUR, 2);
    // s.filter(s.ERODE);
    // s.filter(s.DILATE);

    // compute frame difference (from https://github.com/kylemcdonald/cv-examples/blob/master/FrameDifference)

    s.loadPixels();
    let total = 0;

    let thresholdAmount = 0.5 * 255;
    thresholdAmount *= 3; // 3 for r, g, b

    if (!previousPixels) {
      previousPixels = s.pixels;
    }

    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dR = Math.abs(s.pixels[i + 0] - previousPixels[i + 0]);
        const dG = Math.abs(s.pixels[i + 1] - previousPixels[i + 1]);
        const dB = Math.abs(s.pixels[i + 2] - previousPixels[i + 2]);

        previousPixels[i + 0] = s.pixels[i + 0];
        previousPixels[i + 1] = s.pixels[i + 1];
        previousPixels[i + 2] = s.pixels[i + 2];

        const diffs = (dR + dG + dB);
        let output = 0;
        if (diffs > thresholdAmount) {
          output = 255;
          total += diffs;
        }
        s.pixels[i++] = output;
        s.pixels[i++] = output;
        s.pixels[i++] = output;
        i++;
      }
    }
    if (total > 0) {
      // console.log(total);
      s.updatePixels();
    }
  }
}

const sketch = new p5(Sketch);

let prevData = []
const realtime = new Realtime({
  onData: ({ name, data }) => {
    if (!prevData) {
      prevData = data;
    }
    sketch.data = data.map((d, i) => {
      if (prevData[i]) {
        return {
          a: sketch.lerp(d.a, prevData.a, 0.5),
          d: sketch.lerp(d.d, prevData.d, 0.5),
          x: sketch.lerp(d.x, prevData.x, 0.5),
          y: sketch.lerp(d.y, prevData.y, 0.5),
        }
      } else {
        return d
      }
    });
    // console.log(data.length);
  }
});
