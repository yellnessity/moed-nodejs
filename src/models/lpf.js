export function lpf(fc, m, dt) {
    const localSet = {
      x: [],
      y: [],
    }

    const d = [0.35577019, 0.2436983, 0.07211497, 0.00630165];
    const rightPart = [];
    rightPart.push(2 * fc * dt);

    for (let i = 1; i <= m; i++) rightPart.push(Math.sin(2 * fc * Math.PI * i * dt) / (Math.PI * i));
    rightPart[m] /= 2;

    let sumg = rightPart[0];
    for (let i = 1; i <= m; i++) {
        let sum = d[0];
        for (let k = 1; k < 3; k++) sum += 2 * d[k] * Math.cos((Math.PI * i / m) * k);
        rightPart[i] *= sum;
        sumg += 2 * rightPart[i];
    }
    for (let i = 0; i <= m; ++i) {
        rightPart[i] /= sumg;
    }

    for (let i = -m; i < m; i++) {
        localSet.x.push(i);
    }
    localSet.y = rightPart.slice(1).reverse().concat(rightPart);

    return localSet;
}