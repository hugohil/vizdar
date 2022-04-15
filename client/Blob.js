import { dist } from './utils';

export default class Blob {
  constructor (x, y) {
    this.minx = x;
    this.maxx = x;
    this.miny = y;
    this.maxy = y;
    this.center = this.getCenter();
  }

  size () {
    return ((this.maxx - this.minx) * (this.maxy - this.miny));
  }

  getCenter () {
    const x = ((this.minx + this.maxx) / 2);
    const y = ((this.miny + this.maxy) / 2);
    return { x, y };
  }

  isNear (point, distance) {
    const { x, y } = this.center;

    return dist(x, y, point.x, point.y) <= distance;
  }

  addPoint(point) {
    this.minx = Math.min(this.minx, point.x);
    this.maxx = Math.max(this.maxx, point.x);

    this.miny = Math.min(this.miny, point.y);
    this.maxy = Math.max(this.maxy, point.y);

    this.center = this.getCenter();
  }
}
