import { dist } from './utils';

export default class Blob {
  constructor (x, y) {
    this.minx = x;
    this.maxx = x;
    this.miny = y;
    this.maxy = y;
  }

  size () {
    return ((this.maxx - this.minx) * (this.maxy - this.miny));
  }

  isNear (point, distance) {
    const cx = ((this.minx + this.maxx) / 2);
    const cy = ((this.miny + this.maxy) / 2);

    return dist(cx, cy, point.x, point.y) <= distance;
  }

  addPoint(point) {
    this.minx = Math.min(this.minx, point.x);
    this.maxx = Math.max(this.maxx, point.x);

    this.miny = Math.min(this.miny, point.y);
    this.maxy = Math.max(this.maxy, point.y);
  }
}
