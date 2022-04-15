export function d2r (deg) {
  return deg * (Math.PI / 180);
}

export function lerp (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
}

export function dist (x1, y1, x2, y2) {
  const a = (x1 - x2);
  const b = (y1 - y2);

  return Math.sqrt((a * a) + (b * b));
};