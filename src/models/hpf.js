import { lpf } from "./lpf"

export function hpf(fc, m, dt) {
    const localSet = {
      x: [],
      y: [],
    }

    const lpfModel = lpf(fc, m, dt);
  
    lpfModel.y.forEach((value, i) => {
        localSet.x.push(i);
        localSet.y.push(i === m ? 1 - value : -1 * value);
    })
  
    return localSet;
  }