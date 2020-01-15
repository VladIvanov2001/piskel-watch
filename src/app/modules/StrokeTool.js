class StrokeTool{
    constructor(DOMcanvas) {
        this.DOMcanvas = DOMcanvas;
    }

    down() {
        const canvasLeft = this.DOMcanvas.canvas.getBoundingClientRect().left;
        const canvasTop = this.DOMcanvas.canvas.getBoundingClientRect().top;
        [this.startX, this.startY] = [+(event.clientX - canvasLeft).toFixed(4), +(event.clientY - canvasTop).toFixed(4)];
    }

    up() {
        const canvasLeft = this.DOMcanvas.canvas.getBoundingClientRect().left;
        const canvasTop = this.DOMcanvas.canvas.getBoundingClientRect().top;
        [this.endX, this.endY] = [+(event.clientX - canvasLeft).toFixed(4), +(event.clientY - canvasTop).toFixed(4)];

        this.DOMcanvas.drawLineBetween(this.startX, this.startY, this.endX, this.endY);
    }
}

export default StrokeTool;