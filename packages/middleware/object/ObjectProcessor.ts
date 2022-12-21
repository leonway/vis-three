import { EVENTNAME, ObjectEvent } from "@vis-three/event-manager-plugin";
import { IgnoreAttribute, syncObject } from "@vis-three/utils";
import { Object3D, Vector3 } from "three";
import { CONFIGTYPE } from "../constants/configType";
import { EngineSupport } from "../engine";
import { EventLibrary } from "../library/EventLibrary";
import {
  defineProcessor,
  emptyHandler,
  ProcessorCommands,
  ProcessParams,
  RegCommand,
} from "../module";
import { globalAntiShake } from "../utils";
import { ObjectConfig } from "./ObjectConfig";

export interface ObjectCacheData {
  lookAtTarget: Vector3 | null;
  updateMatrixWorldFun: ((focus: boolean) => void) | null;
}

const objectCacheMap = new WeakMap<Object3D, ObjectCacheData>();

// 物体的lookAt方法
export const lookAtHandler = function <
  C extends ObjectConfig,
  O extends Object3D
>({ target, config, value, engine }: ProcessParams<C, O, EngineSupport>) {
  // 不能自己看自己
  if (config.vid === value) {
    console.warn(`can not set object lookAt itself.`);
    return;
  }

  let cacheData = objectCacheMap.get(target)!;

  if (!cacheData) {
    cacheData = { lookAtTarget: null, updateMatrixWorldFun: null };
    objectCacheMap.set(target, cacheData);
  }

  if (!value) {
    if (!cacheData.updateMatrixWorldFun) {
      return;
    }

    target.updateMatrixWorld = cacheData.updateMatrixWorldFun;
    cacheData.lookAtTarget = null;
    cacheData.updateMatrixWorldFun = null;
    return;
  }

  globalAntiShake.exec((finish) => {
    const lookAtTarget = engine.compilerManager.getObject3D(value);

    if (!lookAtTarget) {
      if (finish) {
        console.warn(
          `lookAt handler can not found this vid mapping object: '${value}'`
        );
      }
      return false;
    }

    const updateMatrixWorldFun = target.updateMatrixWorld;

    cacheData.updateMatrixWorldFun = updateMatrixWorldFun;
    cacheData.lookAtTarget = lookAtTarget.position;

    target.updateMatrixWorld = (focus: boolean) => {
      updateMatrixWorldFun.call(target, focus);
      target.lookAt(cacheData!.lookAtTarget!);
    };

    return true;
  });
};

const eventSymbol = "vis.event";

// 添加事件
export const addEventHanlder = function <
  C extends ObjectConfig,
  O extends Object3D
>({ target, path, value, engine }: ProcessParams<C, O, EngineSupport>) {
  const eventName = path[0];

  if (!EventLibrary.has(value.name)) {
    console.warn(`EventLibrary: can not support this event: ${value.name}`);
    return;
  }

  // 生成函数
  const fun = EventLibrary.generateEvent(value, engine);

  // 映射缓存
  const symbol = Symbol.for(eventSymbol);
  value[symbol] = fun;

  // 绑定事件
  (<Object3D<ObjectEvent>>(<unknown>target)).addEventListener(eventName, fun);
};

// 移除事件
export const removeEventHandler = function <
  C extends ObjectConfig,
  O extends Object3D
>({ target, path, value }: ProcessParams<C, O, EngineSupport>) {
  const eventName = path[0];
  const fun = value[Symbol.for(eventSymbol)];

  if (!fun) {
    console.warn(`event remove can not fun found event in config`, value);
    return;
  }

  target.removeEventListener(eventName, fun!);
  delete value[Symbol.for(eventSymbol)];
};

// 更新事件
export const updateEventHandler = function <
  C extends ObjectConfig,
  O extends Object3D
>({ target, config, path, engine }: ProcessParams<C, O, EngineSupport>) {
  // fixed: cover empty array
  if (path.length < 2) {
    return;
  }
  const eventName = path[0];
  const eventConfig = config[path[0]][path[1]];

  const fun = eventConfig[Symbol.for(eventSymbol)];

  if (!fun) {
    console.warn(`event remove can not fun found event in config`, eventConfig);
    return;
  }

  target.removeEventListener(eventName, fun!);

  // 生成函数
  const newFun = EventLibrary.generateEvent(eventConfig, engine);

  // 映射缓存
  eventConfig[Symbol.for(eventSymbol)] = newFun;

  // 绑定事件
  (<Object3D<ObjectEvent>>(<unknown>target)).addEventListener(
    eventName,
    newFun
  );
};

// 添加子项
export const addChildrenHanlder = function <
  C extends ObjectConfig,
  O extends Object3D
>({ target, config, value, engine }: ProcessParams<C, O, EngineSupport>) {
  globalAntiShake.exec((finish) => {
    const childrenConfig = engine.getConfigBySymbol(value) as ObjectConfig;
    if (!childrenConfig) {
      if (finish) {
        console.warn(` can not foud object config in engine: ${value}`);
      }
      return false;
    }

    // children如果有parent先从parent移除
    if (childrenConfig.parent && childrenConfig.parent !== config.vid) {
      const parentConfig = engine.getConfigBySymbol(
        childrenConfig.parent
      ) as ObjectConfig;

      if (!parentConfig) {
        if (finish) {
          console.warn(
            ` can not foud object parent config in engine: ${childrenConfig.parent}`
          );
        }
        return false;
      }

      parentConfig.children.splice(parentConfig.children.indexOf(value), 1);
    }

    childrenConfig.parent = config.vid;

    const childrenObject = engine.compilerManager.getObject3D(value);

    if (!childrenObject) {
      if (finish) {
        console.warn(`can not found this vid in engine: ${value}.`);
      }
      return false;
    }

    target.add(childrenObject);
    return true;
  });
};

// 移除子项
export const removeChildrenHandler = function <
  C extends ObjectConfig,
  O extends Object3D
>({ target, config, value, engine }: ProcessParams<C, O, EngineSupport>) {
  const childrenObject = engine.compilerManager.getObject3D(value);

  if (!childrenObject) {
    console.warn(`can not found this vid in engine: ${value}.`);
    return;
  }

  target.remove(childrenObject);

  // 更新children对象的parent
  const childrenConfig = engine.getConfigBySymbol(value) as ObjectConfig;
  if (!childrenConfig) {
    console.warn(`can not found this vid in engine: ${value}.`);
    return;
  }

  childrenConfig.parent = "";
};

export const objectCreate = function <
  C extends ObjectConfig,
  O extends Object3D
>(object: O, config: C, filter: IgnoreAttribute<C>, engine: EngineSupport): O {
  const asyncFun = Promise.resolve();

  // lookAt
  !filter.lookAt &&
    lookAtHandler({
      target: object,
      config,
      engine,
      value: config.lookAt,
    } as ProcessParams<C, O, EngineSupport>);

  // children
  config.children.forEach((vid) => {
    addChildrenHanlder({
      target: object,
      config,
      value: vid,
      engine,
    } as ProcessParams<C, O, EngineSupport>);
  });

  // event
  for (const eventName of Object.values(EVENTNAME)) {
    globalAntiShake.nextTick(() => {
      config[eventName].forEach((event, i) => {
        addEventHanlder({
          target: object,
          path: [eventName, i.toString()],
          value: event,
          engine,
        } as unknown as ProcessParams<C, O, EngineSupport>);
      });
      return true;
    });
  }

  syncObject(config, object, {
    vid: true,
    type: true,
    lookAt: true,
    parent: true,
    children: true,
    pointerdown: true,
    pointermove: true,
    pointerup: true,
    pointerenter: true,
    pointerleave: true,
    click: true,
    dblclick: true,
    contextmenu: true,
    ...filter,
  });

  return object;
};

export const objectDispose = function <O extends Object3D>(target: O) {
  // @ts-ignore
  target._listener = {};
};

export type ObjectCommands<
  C extends ObjectConfig,
  T extends Object3D
> = ProcessorCommands<C, T, EngineSupport>;

export const objectCommands: ObjectCommands<ObjectConfig, Object3D> = {
  add: {
    pointerdown: addEventHanlder,
    pointerup: addEventHanlder,
    pointermove: addEventHanlder,
    pointerenter: addEventHanlder,
    pointerleave: addEventHanlder,
    click: addEventHanlder,
    dblclick: addEventHanlder,
    contextmenu: addEventHanlder,
    children: addChildrenHanlder,
  },
  set: {
    lookAt: lookAtHandler,
    pointerdown: updateEventHandler,
    pointerup: updateEventHandler,
    pointermove: updateEventHandler,
    pointerenter: updateEventHandler,
    pointerleave: updateEventHandler,
    click: updateEventHandler,
    dblclick: updateEventHandler,
    contextmenu: updateEventHandler,
    parent: emptyHandler,
    children: {
      $reg: [
        {
          reg: new RegExp(".*"),
          handler: addChildrenHanlder,
        },
      ],
    } as Array<undefined> & {
      $reg?: RegCommand<ObjectConfig, Object3D, EngineSupport>[];
    },
  },
  delete: {
    pointerdown: removeEventHandler,
    pointerup: removeEventHandler,
    pointermove: removeEventHandler,
    pointerenter: removeEventHandler,
    pointerleave: removeEventHandler,
    click: removeEventHandler,
    dblclick: removeEventHandler,
    contextmenu: removeEventHandler,
    children: removeChildrenHandler,
  },
};

export default defineProcessor<ObjectConfig, Object3D, EngineSupport>({
  configType: CONFIGTYPE.OBJECT3D,
  commands: objectCommands,
  create(config: ObjectConfig, engine: EngineSupport): Object3D {
    return objectCreate(new Object3D(), config, {}, engine);
  },
  dispose: objectDispose,
});
