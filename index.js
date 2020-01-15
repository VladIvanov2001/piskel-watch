class AdjustmentTools{
    constructor(DOMcanvas) {
        this.DOMcanvas = DOMcanvas;
        this.init();
    }

    init() {
        this.adjustmentPanel = document.createElement('div');
        this.adjustmentPanel.className = 'adjustment_panel';

        this.resolutionPanel = document.createElement('div');
        this.resolutionPanel.className = 'adjustment_panel__res_panel';

        this.makeResolutionButton(1, '|');
        this.makeResolutionButton(2, '||');
        this.makeResolutionButton(3, '|||');
        this.makeResolutionButton(4, '||||');

        this.resLabel = document.createElement('span');
        this.resLabel.textContent = 'pencil size';




        this.cnvSizePanel = document.createElement('div');
        this.cnvSizePanel.className = 'adjustment_panel__cnv_panel';

        this.makeCnvButton(128, '32x32');
        this.makeCnvButton(256, '64x64');
        this.makeCnvButton(512, '128x128');

        this.cnvLabel = document.createElement('span');
        this.cnvLabel.textContent = 'canvas size';

        this.adjustmentPanel.appendChild(this.resolutionPanel);
        this.adjustmentPanel.appendChild(this.resLabel);
        this.adjustmentPanel.appendChild(this.cnvSizePanel);
        this.adjustmentPanel.appendChild(this.cnvLabel);

        const main = document.getElementsByTagName('main')[0];
        main.appendChild(this.adjustmentPanel);
    }

    makeResolutionButton(resCoeff, btnText) {
        const resBtn = document.createElement('button');

        resBtn.thisObject = this;
        resBtn.resCoeff = resCoeff;
        resBtn.className = 'adjustment_panel__res_panel__res_btn';
        resBtn.textContent = btnText;
        resBtn.onclick = function() {
            const resProportion = 32;
            this.thisObject.DOMcanvas.resolution = this.resCoeff * this.thisObject.DOMcanvas.width / resProportion;
        };

        this.resolutionPanel.appendChild(resBtn);
    }

    makeCnvButton(cnvWidth, btnText) {
        const cnvBtn = document.createElement('button');
        cnvBtn.thisObject = this;
        cnvBtn.cnvWidth = cnvWidth;
        cnvBtn.className = 'adjustment_panel__cnv_panel__cnv_btn';
        cnvBtn.textContent = btnText;
        cnvBtn.onclick = function() {
            const canvas = this.thisObject.DOMcanvas.canvas;

            const oldWidth = this.thisObject.DOMcanvas.width;
            const resCoeff = this.cnvWidth / oldWidth;
            this.thisObject.DOMcanvas.resolution *= resCoeff;

            this.thisObject.DOMcanvas.width = this.cnvWidth;
            this.thisObject.DOMcanvas.height = this.cnvWidth;

            canvas.setAttribute('height', this.cnvWidth);
            canvas.setAttribute('width', this.cnvWidth);

            this.thisObject.DOMcanvas.drawDefault();

            this.thisObject.DOMcanvas.changeTool('p');
        };

        this.cnvSizePanel.appendChild(cnvBtn);
    }
}

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

class ToolsPanel{
    constructor(DOMcanvas) {
        this.DOMcanvas = DOMcanvas;
        this.init();
    }

    init() {
        this.panel = document.createElement('div');
        this.panel.thisObject = this;
        this.panel.className = 'tools_panel';
        this.panel.style.height = `${this.DOMcanvas.height}px`;

        const pencil = document.createElement('button');
        pencil.className = 'p';
        const eraser = document.createElement('button');
        eraser.className = 'e';
        const bucket = document.createElement('button');
        bucket.className = 'b';

        const pixelPainter = document.createElement('button');
        pixelPainter.className = 'pp';

        const strokeTool = document.createElement('button');
        strokeTool.className = 'str';



        const tools = [
            pencil,
            eraser,
            bucket,
            pixelPainter,
            strokeTool,
        ]


        for(let tool of tools) {
            tool.textContent = tool.className;
            this.panel.appendChild(tool);
        }

        this.panel.onclick = function(event) {
            const target = event.target;
            if(target.tagName === 'BUTTON') {
                this.thisObject.DOMcanvas.changeTool(target.className);
            }
        };

        const main = document.getElementsByTagName('main')[0];
        main.appendChild(this.panel);
    }
}

class ColorPanel {
    constructor(DOMcanvas) {
        this.DOMcanvas = DOMcanvas;
        this.DOMcanvas.colorPanel = this;
        this.init();
    }

    init() {
        this.panel = document.createElement('div');
        this.panel.thisObject = this;
        this.panel.className = 'color_panel';

        this.currentColorPanel = document.createElement('div');
        this.currentColorPanel.className = 'color_panel__current_color';
        this.currentColorPanel.style.backgroundColor = '#' + this.DOMcanvas.pencil.color;

        this.colorPicker = document.createElement('button');
        this.colorPicker.thisObject = this;
        this.colorPicker.className = 'color_panel__color_picker';
        this.colorPicker.onclick = this.activateColorPicker;

        this.pallete = document.createElement('input');
        this.pallete.thisObject = this;
        this.pallete.className = 'color_panel__pallete';
        this.pallete.type = 'color';
        this.pallete.oninput = function () {
            this.thisObject.changeColor(this.value);
        };

        this.panel.appendChild(this.currentColorPanel);
        this.panel.appendChild(this.colorPicker);
        this.panel.appendChild(this.pallete);

        const main = document.getElementsByTagName('main')[0];
        main.insertBefore(this.panel, this.DOMcanvas.canvas);
    }

    changeColor(color) {
        this.currentColorPanel.style.backgroundColor = color;
        this.pallete.value = color;

        color = color.slice(1);

        this.DOMcanvas.pencil.color = color;
        this.DOMcanvas.pencil.colorBeforeEraser = color;
        this.DOMcanvas.bucket.color = color;
        this.DOMcanvas.ditheringTool.color = color;
        this.DOMcanvas.pixelPainter.color = color;
    }

    activateColorPicker() {
        const DOMcanvas = this.thisObject.DOMcanvas;

        DOMcanvas.prevOnmousedown = DOMcanvas.canvas.onmousedown;
        DOMcanvas.prevOnmouseup = DOMcanvas.canvas.onmouseup;
        DOMcanvas.prevOnclick = DOMcanvas.canvas.onclick;

        DOMcanvas.canvas.onmousedown = null;
        DOMcanvas.canvas.onmouseup = null;

        DOMcanvas.canvas.onclick = function () {
            const canvasLeft = this.getBoundingClientRect().left;
            const canvasTop = this.getBoundingClientRect().top;
            const currentX = ~~(event.clientX - canvasLeft);
            const currentY = ~~(event.clientY - canvasTop);

            const color = this.thisObject.getColorAt(currentX, currentY);
            this.thisObject.colorPanel.changeColor(color);

            this.onmouseup = this.thisObject.prevOnmouseup;
            this.onmousedown = this.thisObject.prevOnmousedown;
            this.onmouseover = null;
            this.onclick = this.thisObject.onclick;

            this.thisObject.prevOnmouseup = null;
            this.thisObject.prevOnmousedown = null;
            this.thisObject.onclick = null;
        };
    }
}


class Frame{
    constructor(framesPanel, frameIndex, imgURL) {
        this.framesPanel = framesPanel;
        this.frameIndex = frameIndex;
        this.imgURL = imgURL;
        this.init();
    }

    init() {
        this.frame = document.createElement('div');
        this.frame.thisObject = this;
        this.frame.className = 'frame';
        this.frame.style.backgroundImage = `url('${this.imgURL}')`;

        this.deleteBtn = document.createElement('button');
        this.deleteBtn.thisObject = this;
        this.deleteBtn.className = 'frame__delete_btn';
        this.deleteBtn.onclick = function() {
            const frames = this.thisObject.framesPanel.frames;

            const ind = this.thisObject.frameIndex;

            this.thisObject.framesPanel.frameArray.splice(ind, 1);

            frames.removeChild(frames.childNodes[ind]);

            const newLength = this.thisObject.framesPanel.frameArray.length;
            for(let i = ind; i < newLength; i += 1) {
                this.thisObject.framesPanel.frameArray[i].frameIndex = i;
            }
        };

        this.duplicateBtn = document.createElement('button');
        this.duplicateBtn.thisObject = this;
        this.duplicateBtn.className = 'frame__duplicate_btn';
        this.duplicateBtn.onclick = function() {
            const frames = this.thisObject.framesPanel.frames;

            const prevOnmousedown = frames.onmousedown;
            const prevOnmouseup = frames.onmouseup;

            frames.onmousedown = null;
            frames.onmouseup = null;

            const frameArray = this.thisObject.framesPanel.frameArray;

            const ind = this.thisObject.frameIndex;

            const imgURLArray = [];
            for(let frame of frameArray) {
                imgURLArray.push(frame.imgURL);
            }
            imgURLArray.splice(ind, 0, frameArray[ind].imgURL);

            const newLength = frameArray.length + 1;
            frameArray.length = 0;
            for(let i = 0; i < newLength; i += 1) {
                frameArray.push(new Frame(this.thisObject.framesPanel, i, imgURLArray[i]));
            }

            while(frames.firstChild) {
                frames.removeChild(frames.firstChild);
            }

            for(let i = 0; i < newLength; i += 1) {
                frames.appendChild(frameArray[i].frame);
            }

            frames.onmousedown = prevOnmousedown;
            frames.onmouseup = prevOnmouseup;
        };

        this.frame.appendChild(this.deleteBtn);
        this.frame.appendChild(this.duplicateBtn);

        this.framesPanel.frames.appendChild(this.frame);
    }
}

class Canvas{
    constructor(width, height, resolution){
        this.width = width;
        this.height = height;
        this.resolution = resolution;
        this.tool = 'p';
        this.coordsCache = [];
        //this.canvas
        //this.context
        this.init();
    }

    init(){
        Array.prototype.includesArray = function(arr) {
            for (let i = 0; i < this.length; i += 1) {
                const currentArr = this[i];
                if(currentArr.every( (x, i) => x == arr[i] )) {
                    return true;
                }
            }
            return false;
        };

        //canvas initialization

        this.dpi = window.devicePixelRatio;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'canvas';
        this.canvas.setAttribute('height', this.height / this.dpi);
        this.canvas.setAttribute('width', this.width / this.dpi);
        this.canvas.thisObject = this;
        const main = document.getElementsByTagName('main')[0];
        main.appendChild(this.canvas);

        this.context = this.canvas.getContext('2d');
        const style_height = +getComputedStyle(this.canvas).getPropertyValue('height').slice(0, -2);
        const style_width = +getComputedStyle(this.canvas).getPropertyValue('width').slice(0, -2);
        this.width = style_width * this.dpi;
        this.height = style_height * this.dpi;

        this.canvas.setAttribute('height', style_height * this.dpi);
        this.canvas.setAttribute('width', style_width * this.dpi);

        this.pencil = new Pencil(this, '000000');

        this.bucket = new Bucket(this, '000000');

        this.strokeTool = new StrokeTool(this);

        this.pixelPainter = new PixelPainter(this, '000000');

        this.drawDefault();

        this.changeTool('p');
    }

    drawRect(x, y, width, height, color){
        this.context.beginPath();
        this.context.rect(x, y, width, height);
        if(typeof color === 'object') {
            this.context.fillStyle = 'rgba(' + color.join(',') + ')';
        }
        else {
            this.context.fillStyle = '#' + color;
        }
        this.context.fill();
    }

    drawMatrix(pixelArray) {
        const length = pixelArray.length;
        const res = this.resolution / 4;
        for(let i = 0; i < length; i += 1) {
            const rowLength = pixelArray[i].length;
            for(let j = 0; j < rowLength; j += 1) {
                const pxColor = pixelArray[i][j];
                this.drawRect(j * res, i * res, res, res, pxColor);
            }
        }
    }

    readMatrix() {
        const matrix = [];
        const res = this.resolution / 4;
        for (let i = 0; i < this.height; i += res) {
            const row = [];
            for(let j = 0; j < this.width; j += res) {
                const color = this.getColorAt(j, i).slice(1);
                row.push(color);
            }
            matrix.push(row);
        }

        return matrix;
    }

    drawDefault(){
        this.drawRect(0, 0, this.width, this.height, 'FFFFFF');
    }

    drawLineBetween(x0, y0, x1, y1, deltaX = this.resolution, deltaY = this.resolution, curColor = this.pencil.color){
        function LinearFunction(x0, y0, x1, y1){
            const k = (y1 - y0) / (x1 - x0);
            const b = y0 - k * x0;
            return x => k * x + b;
        }

        let f = LinearFunction(x0, y0, x1, y1);
        const k = (y1 - y0) / (x1 - x0);
        let y;
        if(Math.abs(k) < 1){
            if(x1 > x0){
                for(let x = x0; x <= x1; x += deltaX){
                    y = f(x);
                    y -= y % deltaY;
                    this.drawRect(x, y, deltaX, deltaY, curColor);
                }
            }
            else{
                for(let x = x0; x >= x1; x -= deltaX){
                    y = f(x);
                    y -= y % deltaY;
                    this.drawRect(x, y, deltaX, deltaY, curColor);
                }
            }
        }
        else{
            f = LinearFunction(y0, x0, y1, x1);
            let x;
            if(y1 > y0){
                for(let y = y0; y <= y1; y += deltaY){
                    x = f(y);
                    x -= x % deltaX;
                    this.drawRect(x, y, deltaX, deltaY, curColor);
                }
            }
            else{
                for(let y = y0; y >= y1; y -= deltaY){
                    x = f(y);
                    x -= x % deltaX;
                    this.drawRect(x, y, deltaX, deltaY, curColor);
                }
            }
        }
    }

    toHex(num){
        const res = num.toString(16);
        return res.length == 1 ? '0' + res : res;
    }

    getColorAt(x, y){
        const pixelColor = this.context.getImageData(x, y, 1, 1).data.slice(0, -1);
        return '#' + this.toHex(pixelColor[0]) + this.toHex(pixelColor[1]) + this.toHex(pixelColor[2]);
    }

    isOfSameColor(){
        const sameColor = this.getColorAt(0, 0);
        for(let x = 0; x < this.width; x += this.resolution){
            for(let y = 0; y < this.height; y += this.resolution){
                const curCol = this.context.getImageData(x, y, this.resolution, this.resolution).data.slice(0, -1);
                if('#' + this.toHex(curCol[0]) + this.toHex(curCol[1]) + this.toHex(curCol[2]) != sameColor){
                    return false;
                }
            }
        }
        return true;
    }

    changeTool(tool){
        if(tool !== 'vmt' && tool !== 'hmt' && tool !=='g') {
            this.tool = tool;
        }

        switch(tool) {
        case 'p':
            this.pencil.color = this.pencil.colorBeforeEraser;
            this.canvas.onmousedown = function() {
                this.thisObject.pencil.down();
            };
            this.canvas.onmouseup = function() {
                this.thisObject.pencil.up();
            };
            this.canvas.onclick = null;
            break;
        case 'b':
            this.canvas.onmousedown = null;
            this.canvas.onmouseup = null;
            this.canvas.onclick = function() {
                this.thisObject.bucket.fillArea();
            };
            break;
        case 'm':
            this.canvas.onmousedown = function() {
                this.thisObject.moveTool.down();
            };
            this.canvas.onmouseup = function() {
                this.thisObject.moveTool.up();
            };
            this.canvas.onclick = null;
            break;
        case 'e':
            this.pencil.colorBeforeEraser = this.pencil.color;
            this.pencil.color = 'FFFFFF';
            this.canvas.onmousedown = function() {
                this.thisObject.pencil.down();
            };
            this.canvas.onmouseup = function() {
                this.thisObject.pencil.up();
            };
            this.canvas.onclick = null;
            break;
        case 'str':
            this.pencil.color = this.pencil.colorBeforeEraser;
            this.canvas.onmousedown = function() {
                this.thisObject.strokeTool.down();
            };
            this.canvas.onmouseup = function() {
                this.thisObject.strokeTool.up();
            };
            this.canvas.onclick = null;
            break;
        case 'pp':
            this.canvas.onmousedown = null;
            this.canvas.onmouseup = null;
            this.canvas.onclick = function() {
                this.thisObject.pixelPainter.paintSamePixels();
            };
            break;
        default:
            throw new Error('Tool error');
        }
    }
}

class FramesPanel{
    constructor(DOMcanvas, frameArray = [], fps = 15) {
        this.DOMcanvas = DOMcanvas;
        this.frameArray = frameArray;
        this.fps = fps;
        this.init();
    }

    init() {
        this.panel = document.createElement('div');
        this.panel.className = 'frames_panel';

        const framesArea = document.createElement('div');
        framesArea.className = 'frames_panel__frames_area';

        this.frames = document.createElement('div');
        this.frames.thisObject = this;
        this.frames.className = 'frames_panel__frames_area__frames';

        this.frames.onmousedown = function(event) {
            event.preventDefault();
            const target = event.target;

            if(target.className == 'frame') {
                this.frameIndex1 = target.thisObject.frameIndex;
                //this.style.cursor = `url(${target.thisObject.imgURL})`;
            }
            else {
                this.frameIndex1 = null;
            }
        };

        this.frames.onmouseup = function(event) {
            event.preventDefault();
            const target = event.target;

            if(target.className == 'frame' && this.frameIndex1 !== null) {
                this.frameIndex2 = target.thisObject.frameIndex;
                const frame1 = document.getElementsByClassName('frame')[this.frameIndex1];
                const frame2 = target;
                [frame2.thisObject.frameIndex, frame1.thisObject.frameIndex] = [this.frameIndex1, this.frameIndex2];
                this.removeChild(frame2);
                this.replaceChild(frame2, frame1);
                this.insertBefore(frame1, document.getElementsByClassName('frame')[this.frameIndex2]);

                const frameArray = this.thisObject.frameArray;
                [frameArray[this.frameIndex1], frameArray[this.frameIndex2]] = [frameArray[this.frameIndex2], frameArray[this.frameIndex1]];
            }
            else {
                this.frameIndex2 = null;
            }

            //this.style.cursor = target.style.cursor;
        };

        this.playButton = document.createElement('button');
        this.playButton.thisObject = this;
        this.playButton.className = 'frames_panel__frames_area__play_btn';
        this.playButton.onclick = function() {
            this.thisObject.play();
        };

        this.preview = document.createElement('div');
        this.preview.className = 'frames_panel__frames_area__preview';

        framesArea.appendChild(this.frames);
        framesArea.appendChild(this.playButton);
        framesArea.appendChild(this.preview);



        const settingsArea = document.createElement('div');
        settingsArea.className = 'frames_panel__settings_area';

        this.addFrameButton = document.createElement('button');
        this.addFrameButton.thisObject = this;
        this.addFrameButton.className = 'frames_panel__settings_area__add_frame_btn';
        this.addFrameButton.onclick = function() {
            this.thisObject.addFrame();
        };

        this.fpsInput = document.createElement('input');
        this.fpsInput.thisObject = this;
        this.fpsInput.type = 'range';
        this.fpsInput.className = 'frames_panel__settings_area__fps_input';
        this.fpsInput.setAttribute('min', 1);
        this.fpsInput.setAttribute('max', 24);
        this.fpsInput.oninput = function() {
            this.thisObject.changeFPS();
        };

        settingsArea.appendChild(this.addFrameButton);
        settingsArea.appendChild(this.fpsInput);



        this.panel.appendChild(framesArea);
        this.panel.appendChild(settingsArea);

        document.body.appendChild(this.panel);
    }

    changeFPS() {
        this.fps = ~~(+this.fpsInput.value);
    }

    addFrame() {
        const imgURL = this.DOMcanvas.canvas.toDataURL('image/png');

        const frameIndex = this.frameArray.length;
        const newFrame = new Frame(this, frameIndex, imgURL);

        this.frameArray.push(newFrame);
    }

    showFrame(frame) {
        frame.framesPanel.preview.style.backgroundImage = `url('${frame.imgURL}')`;
    }

    play() {
        const framesAmount = this.frameArray.length;
        for(var i = 0; i < framesAmount; i += 1) {
            setTimeout(this.showFrame, i * 1000 / this.fps, this.frameArray[i]);
        }
    }
}

const cnv = new Canvas(512, 512, 16);

const openFullscreen = () => {
    const elem = document.querySelector('.frames_panel__frames_area__preview');

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
};

const closeFullscreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
};

document.getElementById('full_screen').addEventListener('click', openFullscreen);
const toolsPanel = new ToolsPanel(cnv);

const colorPanel = new ColorPanel(cnv);

const framesPanel = new FramesPanel(cnv, [], 15);

const adjPanel = new AdjustmentTools(cnv);

