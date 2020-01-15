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

export default ToolsPanel;
