export async function restore(pixelArray) {
    var max = -Infinity;
    var min = Infinity;

    for(var i = 0; i < pixelArray.length; i++)
        if(pixelArray[i] > max) max = pixelArray[i];
    
    for(var i = 0; i < pixelArray.length; i++)
        if(pixelArray[i] < min) min = pixelArray[i];

    const restoredBuffer = pixelArray.map(byte => 255*(byte - min)/(max - min));

    return restoredBuffer;
}