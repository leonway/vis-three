import { Tween } from "@tweenjs/tween.js";
import {
  BasicEventConfig,
  EngineSupport,
  EventGenerator,
  ObjectConfig,
  ObjectEvent,
  RenderEvent,
  Vector3Config,
} from "@vis-three/middleware";
import { timingFunction, TIMINGFUNCTION } from "./common";

export interface RotationTo extends BasicEventConfig {
  params: {
    target: string;
    rotation: Vector3Config;
    delay: number;
    duration: number;
    timingFunction: TIMINGFUNCTION;
  };
}

export const config: RotationTo = {
  name: "rotationTo",
  params: {
    target: "",
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
    delay: 0,
    duration: 1000,
    timingFunction: TIMINGFUNCTION.EASING_QUADRATIC_INOUT,
  },
};

export const generator: EventGenerator<RotationTo> = function (
  engine: EngineSupport,
  config: RotationTo
): (event?: ObjectEvent) => void {
  const params = config.params;
  const compiler = engine.compilerManager;
  const object = compiler.getObjectBySymbol(params.target);

  if (!object) {
    console.warn(
      `real time animation moveTO: can not found vid object: ${params.target}`
    );
    return () => {};
  }

  const renderManager = engine.renderManager!;
  // 同步配置
  const supportData = engine.dataSupportManager.getConfigBySymbol<ObjectConfig>(
    params.target
  );

  if (!supportData) {
    console.warn(`can not found object config: ${params.target}`);
    return () => {};
  }

  // 防止重复触发
  let animating = false;

  return () => {
    if (animating) {
      return;
    }

    animating = true;

    const tween = new Tween(object!.rotation)
      .to(params.rotation)
      .duration(params.duration)
      .delay(params.delay)
      .easing(timingFunction[params.timingFunction])
      .start();

    const renderFun = (event: RenderEvent) => {
      tween.update();
    };

    renderManager.addEventListener<RenderEvent>("render", renderFun);

    tween.onComplete(() => {
      renderManager.removeEventListener<RenderEvent>("render", renderFun);
      supportData!.rotation.x = params.rotation.x;
      supportData!.rotation.y = params.rotation.y;
      supportData!.rotation.z = params.rotation.z;
      animating = false;
    });
  };
};
