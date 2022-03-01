export async function amplify(pixelArray) {
    const amplifiedBuffer = pixelArray.map(byte => (byte + 30) * 1.3);
    return amplifiedBuffer;
}