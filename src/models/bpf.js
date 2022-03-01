import { lpf } from "./lpf"

export function bpf(f1, f2, m, dt) {
    const localSet = {
      x: [],
      y: [],
    }

    const lpfModel1 = lpf(f1, m, dt);
    const lpfModel2 = lpf(f2, m, dt);
  
    lpfModel1.y.forEach((value, i) => {
        localSet.x.push(i);
        localSet.y.push(lpfModel2.y[i] - value);
    });
  
    return localSet;
  }