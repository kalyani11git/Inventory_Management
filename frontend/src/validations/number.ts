export function isPositiveNumber(value: string) {
  const n = Number(value);
  return !Number.isNaN(n) && n > 0;
}

export function isNonNegativeInt(value: string) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0;
}
