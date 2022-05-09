import { dist, lerp } from './utils';

export default class Blob {
  constructor (x, y) {
    this.minx = x;
    this.maxx = x;
    this.miny = y;
    this.maxy = y;
    this.center = this.getCenter();
  }

  getSize () {
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
    this.minx = lerp(this.minx, Math.min(this.minx, point.x), 0.5);
    this.maxx = lerp(this.maxx, Math.max(this.maxx, point.x), 0.5);

    this.miny = lerp(this.miny, Math.min(this.miny, point.y), 0.5);
    this.maxy = lerp(this.maxy, Math.max(this.maxy, point.y), 0.5);

    this.center = this.getCenter();
  }
}
