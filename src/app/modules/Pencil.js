class Pencil{
    constructor(DOMcanvas, color){
        this.DOMcanvas = DOMcanvas;
        this.color = color;
        this.colorBeforeEraser = color;
    }

    down(){
        this.DOMcanvas.coordsCache.length = 0;
        const canvasLeft = this.DOMcanvas.canvas.getBoundingClientRect().left;
        const canvasTop = this.DOMcanvas.canvas.getBoundingClientRect().top;
        this.DOMcanvas.canvas.onmousemove = function() {
            let currentX = +(event.clientX - canvasLeft).toFixed(4);
            let currentY = +(event.clientY - canvasTop).toFixed(4);

            currentX -= currentX % this.thisObject.resolution;
            currentY -= currentY % this.thisObject.resolution;

            const lastCoords = this.thisObject.coordsCache[this.thisObject.coordsCache.length - 1];
            if(this.thisObject.coordsCache.length){
                const res = this.thisObject.resolution;
                const lastX = lastCoords[0];
                const lastY = lastCoords[1];
                if(Math.abs(currentX - lastX) >= res || Math.abs(currentY - lastY) >= res){
                    this.thisObject.drawLineBetween(lastX, lastY, currentX, currentY, res, res);
                }
            }
            else{
                this.thisObject.drawRect(currentX, currentY, this.thisObject.resolution, this.thisObject.resolution, this.thisObject.pencil.color);
            }
            this.thisObject.coordsCache.push([currentX, currentY]);
        };
    }

    up(){
        this.DOMcanvas.canvas.onmousemove = null;
    }
}

export default Pencil;