class Bucket{
    constructor(DOMcanvas, color){
        this.DOMcanvas = DOMcanvas;
        this.color = color;
    }

    paintPixel(x, y) {
        this.DOMcanvas.drawRect(x, y, this.fillStep, this.fillStep, this.color);
        
        const upColor = this.DOMcanvas.getColorAt(x, y - this.fillStep);
        const downColor = this.DOMcanvas.getColorAt(x, y + this.fillStep);
        const leftColor = this.DOMcanvas.getColorAt(x - this.fillStep, y);
        const rightColor = this.DOMcanvas.getColorAt(x + this.fillStep, y);
        
        if(upColor == this.oldColor) {
            this.paintPixel(x, y - this.fillStep);
        }

        if(downColor == this.oldColor) {
            this.paintPixel(x, y + this.fillStep);
        }

        if(leftColor == this.oldColor) {
            this.paintPixel(x - this.fillStep, y);
        }

        if(rightColor == this.oldColor) {
            this.paintPixel(x + this.fillStep, y);
        }
    }

    fillArea() {
        this.fillStep = this.DOMcanvas.resolution;

        const canvasLeft = this.DOMcanvas.canvas.getBoundingClientRect().left;
        const canvasTop = this.DOMcanvas.canvas.getBoundingClientRect().top;
        [this.currentX, this.currentY] = [+(event.clientX - canvasLeft).toFixed(4), +(event.clientY - canvasTop).toFixed(4)];

        this.currentX -= this.currentX % this.fillStep;
        this.currentY -= this.currentY % this.fillStep;

        this.oldColor = this.DOMcanvas.getColorAt(this.currentX, this.currentY);
        if(this.DOMcanvas.isOfSameColor()) {
            this.DOMcanvas.drawRect(0, 0, this.DOMcanvas.width, this.DOMcanvas.height, this.color);
        }
        else {
            if(this.color != this.oldColor) {
                this.paintPixel(this.currentX, this.currentY);
            }
        }
    }
}

export default Bucket;