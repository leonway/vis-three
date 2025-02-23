import { Compiler, COMPILER_MANAGER_PLUGIN, CONFIGTYPE, DATA_SUPPORT_MANAGER_PLUGIN, MODULETYPE, uniqueSymbol, } from "@vis-three/middleware";
import { ORBIT_CONTROLS_PLUGIN } from "@vis-three/orbit-controls-plugin";
import { transPkgName } from "@vis-three/utils";
import OrbitControlsProcessor from "./OrbitControlsProcessor";
import { name as pkgname } from "./package.json";
export const ORBIT_CONTROLS_SUPPORT_STRATEGY = transPkgName(pkgname);
export const OrbitControlsSupportStrategy = function () {
    return {
        name: ORBIT_CONTROLS_SUPPORT_STRATEGY,
        condition: [
            COMPILER_MANAGER_PLUGIN,
            DATA_SUPPORT_MANAGER_PLUGIN,
            ORBIT_CONTROLS_PLUGIN,
        ],
        exec(engine) {
            const compiler = engine.compilerManager.getCompiler(MODULETYPE.CONTROLS);
            compiler.map.set(uniqueSymbol(CONFIGTYPE.ORBITCONTROLS), engine.orbitControls);
            compiler.weakMap.set(engine.orbitControls, uniqueSymbol(CONFIGTYPE.ORBITCONTROLS));
            Compiler.processor(OrbitControlsProcessor);
        },
        rollback() { },
    };
};
