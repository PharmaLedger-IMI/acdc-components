/**Class representing a raw YCbCr 420 image. First chunck of size wxh is the Y plane. 2nd chunk of size wxh/2 is the interleaved CbCr plane */
class PLYCbCrImage {
    /** creates a PLYCbCrImage. The Y-plane and CbCr interpleaved plane are copied seperately.
     * @param  {ArrayBuffer} arrayBuffer raw data
     * @param  {Number} width image width, must be even
     * @param  {Number} height image height, must be even
     */
    constructor(arrayBuffer, width, height) {
        this.width = width;
        this.height = height;
        if (!Number.isInteger(this.width / 2) || !Number.isInteger(this.height / 2)) {
            throw `Only even width and height is supported, got w=${this.width}, h=${this.height} `
        }
        this.yArrayBuffer = arrayBuffer.slice(0, this.width * this.height);
        this.cbCrArrayBuffer = arrayBuffer.slice(this.width * this.height)
    }
}

module.exports = {
    PLYCbCrImage
}