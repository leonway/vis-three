import { transPkgName } from "@vis-three/utils";
import { name as pkgname } from "./package.json";
import { COMPILER_MANAGER_PLUGIN, CONFIGFACTORY, CONFIGTYPE, DATA_SUPPORT_MANAGER_PLUGIN, } from "@vis-three/middleware";
import { EFFECT_COMPOSER_PLUGIN } from "@vis-three/effect-composer-plugin";
import { PassCompiler } from "./module/PassCompiler";
import { getSelectiveBloomPassConfig, getSMAAPassConfig, getSSAOPassConfig, getUnrealBloomPassConfig, } from "./module/PassConfig";
import { PASS_CONFIGTYPE } from "./module/constant";
import { PassDataSupport } from "./module/PassDataSupport";
Object.assign(CONFIGTYPE, PASS_CONFIGTYPE);
export const COMPOSER_SUPPORT_STRATEGY = transPkgName(pkgname);
export const ComposerSupportStrategy = function () {
    return {
        name: COMPOSER_SUPPORT_STRATEGY,
        condition: [
            COMPILER_MANAGER_PLUGIN,
            DATA_SUPPORT_MANAGER_PLUGIN,
            EFFECT_COMPOSER_PLUGIN,
        ],
        exec(engine) {
            CONFIGFACTORY[PASS_CONFIGTYPE.SMAAPASS] = getSMAAPassConfig;
            CONFIGFACTORY[PASS_CONFIGTYPE.UNREALBLOOMPASS] =
                getUnrealBloomPassConfig;
            CONFIGFACTORY[PASS_CONFIGTYPE.SELECTIVEBLOOMPASS] =
                getSelectiveBloomPassConfig;
            CONFIGFACTORY[PASS_CONFIGTYPE.SSAOPASS] = getSSAOPassConfig;
            const support = new PassDataSupport();
            const compiler = new PassCompiler();
            compiler.useEngine(engine);
            support.addCompiler(compiler);
            engine.dataSupportManager.extend(support);
            engine.compilerManager.extend(compiler);
        },
        rollback() { },
    };
};
export { PASS_CONFIGTYPE, PassDataSupport };
