import { dist, lerp } from './utils';

export default class Blob {
  constructor (x, y, id, lifespan) {
    this.minx = x;
    this.maxx = x;
    this.miny = y;
    this.maxy = y;
    this.lifespan = lifespan;
    this.id = id;
  }

  clone (instant) {
    this.minx = instant.minx;
    this.maxx = instant.maxx;
    this.miny = instant.miny;
    this.maxy = instant.maxy;
    this.lifespan = instant.lifespan;
  }

  getSize () {
    return ((this.maxx - this.minx) * (this.maxy - this.miny));
  }

  getDimensions () {
    return {
      x: this.maxx - this.minx,
      y: this.maxy - this.miny
    }
  }

  getCenter () {
    const x = ((this.minx + this.maxx) / 2);
    const y = ((this.miny + this.maxy) / 2);
    return { x, y };
  }

  isNear (point, distance) {
    const { x, y } = this.getCenter();

    return dist(x, y, point.x, point.y) <= distance;
  }

  mergeBlob (blob) {
    this.minx = lerp(this.minx, blob.minx, 0.75);
    this.maxx = lerp(this.maxx, blob.maxx, 0.75);

    this.miny = lerp(this.miny, blob.miny, 0.75);
    this.maxy = lerp(this.maxy, blob.maxy, 0.75);
  }

  addPoint (point) {
    this.minx = lerp(this.minx, Math.min(this.minx, point.x), 0.5);
    this.maxx = lerp(this.maxx, Math.max(this.maxx, point.x), 0.5);

    this.miny = lerp(this.miny, Math.min(this.miny, point.y), 0.5);
    this.maxy = lerp(this.maxy, Math.max(this.maxy, point.y), 0.5);
  }
}
