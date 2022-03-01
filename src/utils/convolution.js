export function convolution(modelX, modelH) {
    const localSet = {
      x: [],
      y: [],
    }
  
    modelX.y.forEach((_, i) => {
        localSet.x.push(i);
        localSet.y.push(getConvolution(modelX.y, modelH.y, i));
    });
  
    return localSet;
  }
  
  function getConvolution(valuesX, valuesH, j) {
    let sum = 0;
    valuesH.forEach((value, i) => sum = sum + valuesX[(i + j) % valuesX.length] * value);
    return sum;
  }