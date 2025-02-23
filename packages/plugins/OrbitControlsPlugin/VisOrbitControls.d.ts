import { Camera, MOUSE, Spherical, TOUCH, Vector3 } from "three";
import { EventDispatcher } from "@vis-three/core/eventDispatcher";
export declare class VisOrbitControls extends EventDispatcher {
    object: Camera;
    domElement: HTMLElement;
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    keys: {
        LEFT: string;
        UP: string;
        RIGHT: string;
        BOTTOM: string;
    };
    mouseButtons: {
        LEFT: null;
        MIDDLE: MOUSE;
        RIGHT: MOUSE;
    };
    touches: {
        ONE: TOUCH;
        TWO: TOUCH;
    };
    target0: Vector3;
    position0: Vector3;
    zoom0: number;
    _domElementKeyEvents: HTMLElement | null;
    spherical: Spherical;
    reset: () => void;
    update: () => void;
    onContextMenu: (event?: any) => void;
    onPointerDown: (event?: any) => void;
    onPointerCancel: (event?: any) => void;
    onMouseWheel: (event?: any) => void;
    onPointerMove: (event?: any) => void;
    onPointerUp: (event?: any) => void;
    onKeyDown: (event?: any) => void;
    constructor(object?: Camera, domElement?: HTMLElement);
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    getDistance(): number;
    listenToKeyEvents(domElement: any): void;
    saveState(): void;
    setCamera(camera: Camera): void;
    setDom(dom: HTMLElement): void;
    dispose(): void;
}
