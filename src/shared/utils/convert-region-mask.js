const pako = require('pako');

/**
 * Parses mask string as received from custom scene definitions regions XML format
 * in legacy SW API (IRE).
 *
 * The width and height should be integers.
 *
 * The mask should be the mask string parsed from the "regionsXml" data from a custom scene definition
 * from the endpoint: https://www.sherwin-williams.com/color-visualization/services/scene/custom
 *
 * This function returns a 2D context for a canvas containing the image data.
 *
 *
 * @param options Object containing properties mask, width, height
 * @returns {CanvasRenderingContext2D}
 */
function convertRegionMask({mask, width, height}) {
    // base64-decode
    let binaryString = window.atob(mask);
    let binaryChars = binaryString.split('');
    let binaryCharCodes = binaryChars.map(c => c.charCodeAt(0));
    let binaryCharArray = new Uint8Array(binaryCharCodes);
    // zlib-decompress
    let byteArray = pako.inflate(binaryCharArray);

    // generate image data
    let canvas = document.createElement('CANVAS');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    let imageData = context.getImageData(0, 0, width, height);
    // convert ARGB to RGBA for backwards compatibility
    for (let bi = 0; bi < byteArray.length; bi += 4) {
        let a = byteArray[bi + 0];
        let r = byteArray[bi + 1];
        let g = byteArray[bi + 2];
        let b = byteArray[bi + 3];
        imageData.data[bi + 0] = r;
        imageData.data[bi + 1] = g;
        imageData.data[bi + 2] = b;
        imageData.data[bi + 3] = a;
    }
    context.putImageData(imageData, 0, 0);
    return context;
}

module.exports = convertRegionMask;
