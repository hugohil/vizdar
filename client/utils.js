export function d2r (deg) {
  return deg * (Math.PI / 180);
}

export function lerp (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
}

export function pointDist (pointA, pointB) {
  return dist(pointA.x, pointA.y, pointB.x, pointB.y);
};

export function dist (x1, y1, x2, y2) {
  const a = (x1 - x2);
  const b = (y1 - y2);

  return Math.sqrt((a * a) + (b * b));
};

export function isNear (pointA, pointB, distance) {
  return dist(pointA.x, pointA.y, pointB.x, pointB.y) <= distance;
};

export function getClosest (array, target) {
  const closest = array.reduce((a, b) => {
    const db = dist(b.x, b.y, target.x, target.y)
    const da = dist(a.x, a.y, target.x, target.y)

    return (db < da) ? b : a
  });
  const distance = dist(closest.x, closest.y, target.x, target.y);

  return { closest, distance }
}
