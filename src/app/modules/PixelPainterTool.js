class PixelPainter{
    constructor(DOMcanvas, color) {
        this.DOMcanvas = DOMcanvas;
        this.color = color;
    }

    colorDifference(hex1, hex2) {
        const r1 = parseInt('0x' + hex1[0] + hex1[1]);
        const g1 = parseInt('0x' + hex1[2] + hex1[3]);
        const b1 = parseInt('0x' + hex1[4] + hex1[5]);

        const r2 = parseInt('0x' + hex2[0] + hex2[1]);
        const g2 = parseInt('0x' + hex2[2] + hex2[3]);
        const b2 = parseInt('0x' + hex2[4] + hex2[5]);

        return ((r2 - r1) * (r2 - r1) + (g2 - g1) * (g2 - g1) + (b2 - b1) * (b2 - b1)) ** 0.5;
    }

    paintSamePixels(){
        const canvasLeft = this.DOMcanvas.canvas.getBoundingClientRect().left;
        const canvasTop = this.DOMcanvas.canvas.getBoundingClientRect().top;
        [this.currentX, this.currentY] = [+(event.clientX - canvasLeft).toFixed(4), +(event.clientY - canvasTop).toFixed(4)];
        this.oldColor = this.DOMcanvas.getColorAt(this.currentX, this.currentY).slice(1);
        if(this.DOMcanvas.isOfSameColor()){
            this.DOMcanvas.drawRect(0, 0, this.DOMcanvas.width, this.DOMcanvas.height, this.color);
        }
        else{
            const pixelColorsToPaint = [];
            const pixelColorsNotToPaint = [];
            const requiredDif = 30;

            const prevRes = this.DOMcanvas.resolution;
            this.DOMcanvas.resolution = prevRes / 2;
            const matrix = this.DOMcanvas.readMatrix();

            const height = matrix.length;
            for(let i = 0; i < height; i += 1) {
                const length = matrix[i].length;
                for(let j = 0; j < length; j += 1) {
                    if (pixelColorsToPaint.includes(matrix[i][j])) {
                        this.DOMcanvas.drawRect(j * prevRes / 8, i * prevRes / 8, prevRes / 8, prevRes / 8, this.color);
                    }
                    else {
                        if( !pixelColorsNotToPaint.includes(matrix[i][j]) ) {
                            const colorDif = this.colorDifference(matrix[i][j], this.oldColor);
                            if(colorDif <= requiredDif) {
                                pixelColorsToPaint.push(matrix[i][j]);
                                this.DOMcanvas.drawRect(j * prevRes / 8, i * prevRes / 8, prevRes / 8, prevRes / 8, this.color);
                            }
                            else {
                                pixelColorsNotToPaint.push(matrix[i][j]);
                            }
                        }
                    }
                }
            }

            this.DOMcanvas.resolution = prevRes;
        }
    }
}

export default PixelPainter;