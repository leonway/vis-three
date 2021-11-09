import { Vector2 } from "three";
export class SelectionHelper {
    dom;
    element;
    startPoint;
    pointTopLeft;
    pointBottomRight;
    isDown;
    constructor(dom) {
        this.dom = dom;
        // TODO: 选择框的样式自定义
        this.element = document.createElement('div');
        this.element.style.pointerEvents = 'none';
        this.startPoint = new Vector2();
        this.pointTopLeft = new Vector2();
        this.pointBottomRight = new Vector2();
        this.isDown = false;
    }
    onSelectStart(event) {
        this.isDown = true;
        this.dom.appendChild(this.element);
        this.element.style.left = event.clientX + 'px';
        this.element.style.top = event.clientY + 'px';
        this.element.style.width = '0px';
        this.element.style.height = '0px';
        this.startPoint.x = event.clientX;
        this.startPoint.y = event.clientY;
    }
    onSelectMove(event) {
        if (!this.isDown) {
            return;
        }
        this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX);
        this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY);
        this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX);
        this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY);
        this.element.style.left = this.pointTopLeft.x + 'px';
        this.element.style.top = this.pointTopLeft.y + 'px';
        this.element.style.width = (this.pointBottomRight.x - this.pointTopLeft.x) + 'px';
        this.element.style.height = (this.pointBottomRight.y - this.pointTopLeft.y) + 'px';
    }
    onSelectOver(event) {
        if (!this.isDown) {
            return;
        }
        this.isDown = false;
        this.dom.removeChild(this.element);
    }
}
//# sourceMappingURL=SelectionHelper.js.map