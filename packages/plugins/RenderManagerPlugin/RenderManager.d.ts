import { BaseEvent, EventDispatcher } from "@vis-three/core";
export interface RenderEvent extends BaseEvent {
    delta: number;
    total: number;
}
export declare enum RENDER_EVENT {
    RENDER = "render",
    PLAY = "play",
    STOP = "stop"
}
export declare class RenderManager extends EventDispatcher {
    private clock;
    private animationFrame;
    private fps;
    private timer;
    private playFun;
    constructor(fps?: number);
    /**
     * 设置fps
     * @param fps 帧率
     * @returns
     */
    setFPS(fps: number): this;
    /**
     * 渲染一帧
     */
    render: () => void;
    /**
     * 根据指定fps进行持续渲染
     */
    play: () => void;
    /**
     * 停止渲染
     */
    stop: () => void;
    /**
     * 是否处于渲染当中
     * @returns boolean
     */
    hasRendering: () => boolean;
    /**
     * 是否有效渲染队列
     * @returns boolean
     */
    hasVaildRender: () => boolean;
    /**
     * 销毁内存
     */
    dispose(): void;
}
