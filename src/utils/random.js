export const randomInt = (min, max) => {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

export const choose = (items) => {
  if (!items.length) return undefined;
  return items[randomInt(0, items.length - 1)];
};

export const sample = (items, count) => {
  const copy = [...items];
  const selected = [];
  while (copy.length && selected.length < count) {
    const index = randomInt(0, copy.length - 1);
    selected.push(copy.splice(index, 1)[0]);
  }
  return selected;
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
