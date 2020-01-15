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


export default ColorPanel;
