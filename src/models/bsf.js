import { lpf } from "./lpf"

export function bsf(f1, f2, m, dt) {
    const localSet = {
      x: [],
      y: [],
    }

    const lpfModel1 = lpf(f1, m, dt);
    const lpfModel2 = lpf(f2, m, dt);
  
    lpfModel1.y.forEach((value, i) => {
        localSet.x.push(i);
        localSet.y.push(i === m ? 1 + value - lpfModel2.y[i] : value - lpfModel2.y[i]);
    });
  
    return localSet;
  }