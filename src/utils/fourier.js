export function fourier(dataset) {
  const fgr = 1 / (1 / 22050 * 2);
  const df = (2 * fgr) / dataset.x.length;

  const fourierSet = {
    x: [],
    y: [],
  }

  for (let i = 0; i < fgr / df; i++) {
    let re = 0, im = 0;
    fourierSet.x.push(i*df);
    re = getRe(dataset.y, i);
    im = getIm(dataset.y, i);

    fourierSet.y.push(Math.sqrt(re*re + im*im));
  }

  return fourierSet;
}

function getRe(values, n) {
  let sum = 0;
  for (let i = 0; i < values.length - 1; i++) {
    sum = sum + (values[i] * Math.cos((2 * Math.PI * i * n) / values.length));
  }
  return sum / values.length;
}

function getIm(values, n) {
  let sum = 0;
  for (let i = 0; i < values.length - 1; i++) {
    sum = sum + (values[i] * Math.sin((2 * Math.PI * i * n) / values.length));
  }
  return sum / values.length;
}