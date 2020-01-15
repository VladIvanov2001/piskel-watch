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

export default Frame;