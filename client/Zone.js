import pip from 'point-in-polygon';
import { dist } from './utils';

export default class Zone {
  constructor (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  size () {
    return (this.width * this.height);
  }

  isNear (point, distance) {
    return dist(this.x, this.y, point.x, point.y) <= distance;
  }

  getCornerPoints () {
    const topleft = [ this.x - (this.width / 2), this.y - (this.height / 2) ];
    const topright = [ this.x + (this.width / 2), this.y - (this.height / 2) ];
    const bottomright = [ this.x + (this.width / 2), this.y + (this.height / 2) ];
    const bottomleft = [ this.x - (this.width / 2), this.y + (this.height / 2) ];
    return [ topleft, topright, bottomright, bottomleft ];
  }

  getNormPosInside (point) {
    return {
      x: ((point.x - (this.x - (this.width / 2))) / this.width),
      y: ((point.y - (this.y - (this.height / 2))) / this.height),
    }
  }

  isInside (point) {
    return pip([point.x, point.y], this.getCornerPoints());
  }
}
