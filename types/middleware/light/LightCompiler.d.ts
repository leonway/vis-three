import { Light, Scene } from "three";
import { Compiler, CompilerTarget, ObjectCompiler } from "../../core/Compiler";
import { SymbolConfig } from "../common/CommonConfig";
import { PointLightConfig, SpotLightConfig } from "./LightConfig";
export interface LightCompilerTarget extends CompilerTarget {
    [key: string]: SpotLightConfig | PointLightConfig;
}
export interface LightCompilerParameters {
    scene: Scene;
    target: LightCompilerTarget;
}
export declare class LightCompiler extends Compiler implements ObjectCompiler {
    IS_OBJECTCOMPILER: boolean;
    private scene;
    private target;
    private map;
    private weakMap;
    private constructMap;
    constructor(parameters: LightCompilerParameters);
    getSupportVid(object: Light): SymbolConfig['vid'] | null;
    add(vid: string, config: SpotLightConfig | PointLightConfig): void;
    set(path: string[], key: string, value: any): void;
    remove(): void;
    setTarget(target: LightCompilerTarget): this;
    getMap(): Map<SymbolConfig['type'], Light>;
    compileAll(): this;
    dispose(): this;
}
