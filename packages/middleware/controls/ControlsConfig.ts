import { SymbolConfig, uniqueSymbol, Vector3Config } from "../common";
import { CONFIGTYPE } from "../constants/CONFIGTYPE";

export type ControlsConfig = SymbolConfig;

export interface TransformControlsConfig extends ControlsConfig {
  axis: string;
  enabled: boolean;
  mode: string;

  snapAllow: boolean; // 是否开启步幅功能
  rotationSnap: number;
  translationSnap: number;
  scaleSnap: number;

  showX: boolean;
  showY: boolean;
  showZ: boolean;

  size: number;

  space: string;
}

export interface OrbitControlsConfig extends ControlsConfig {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableDamping: boolean;
  dampingFactor: number;
  enabled: boolean;
  enablePan: boolean;
  enableRotate: boolean;
  enableZoom: boolean;
  maxAzimuthAngle: number;
  maxDistance: number;
  maxPolarAngle: number;
  maxZoom: number;
  minAzimuthAngle: number;
  minDistance: number;
  minPolarAngle: number;
  minZoom: number;
  panSpeed: number;
  rotateSpeed: number;
  zoomSpeed: number;
  screenSpacePanning: boolean;
  target: string | Vector3Config | null;
}

export type ControlsAllConfig = TransformControlsConfig | OrbitControlsConfig;

export const getTransformControlsConfig = function (): TransformControlsConfig {
  return {
    vid: uniqueSymbol(CONFIGTYPE.TRNASFORMCONTROLS),
    type: CONFIGTYPE.TRNASFORMCONTROLS,
    axis: "XYZ",
    enabled: true,
    mode: "translate",

    snapAllow: false,
    rotationSnap: (Math.PI / 180) * 10,
    translationSnap: 5,
    scaleSnap: 0.1,

    showX: true,
    showY: true,
    showZ: true,

    size: 1,

    space: "world",
  };
};

export const getOrbitControlsConfig = function (): OrbitControlsConfig {
  return {
    vid: uniqueSymbol(CONFIGTYPE.ORBITCONTROLS),
    type: CONFIGTYPE.ORBITCONTROLS,
    autoRotate: false,
    autoRotateSpeed: 2.0,
    enableDamping: false,
    dampingFactor: 0.05,
    enabled: true,
    enablePan: true,
    enableRotate: true,
    enableZoom: true,
    maxAzimuthAngle: Infinity,
    maxDistance: Infinity,
    maxPolarAngle: Math.PI,
    maxZoom: Infinity,
    minAzimuthAngle: -Infinity,
    minDistance: 0,
    minPolarAngle: 0,
    minZoom: 0,
    panSpeed: 1,
    rotateSpeed: 1,
    zoomSpeed: 1,
    screenSpacePanning: true,
    target: null,
  };
};
