import { CONFIGTYPE, defineProcessor } from "@vis-three/middleware";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { PASS_CONFIGTYPE } from "../constant";
import { ComposerSupportEngine } from "../PassCompiler";

import { SMAAPassConfig } from "../PassConfig";

export default defineProcessor<SMAAPassConfig, SMAAPass, ComposerSupportEngine>(
  {
    configType: PASS_CONFIGTYPE.SMAAPASS,
    create(config, engine): SMAAPass {
      const pixelRatio = window.devicePixelRatio;

      const pass = new SMAAPass(
        engine.dom
          ? engine.dom.offsetWidth * pixelRatio
          : window.innerWidth * pixelRatio,
        engine.dom
          ? engine.dom.offsetHeight * pixelRatio
          : window.innerWidth * pixelRatio
      );
      return pass;
    },
    dispose(pass) {
      // pass.dispose();
    },
  }
);
