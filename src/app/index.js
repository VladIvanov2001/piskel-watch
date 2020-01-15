import '../style/app.scss';
import Pencil from '../app/modules/Pencil.js';
import Bucket from '../app/modules/Bucket.js';

import PixelPainter from '../app/modules/PixelPainterTool.js';

import StrokeTool from '../app/modules/StrokeTool.js';


import ToolsPanel from '../app/modules/ToolsPanel.js';
import ColorPanel from '../app/modules/ColorPanel.js';

import Frame from '../app/modules/Frame.js';

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
