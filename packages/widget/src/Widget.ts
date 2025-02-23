import { EventDispatcher } from "@vis-three/core";
import {
  CONFIGFACTORY,
  CONFIGTYPE,
  EngineSupport,
  EngineSupportLoadOptions,
  generateConfig,
  getModule,
  globalAntiShake,
  GroupConfig,
  Ignore,
  OBJECTMODULE,
} from "@vis-three/middleware";
import { ObjectConfig } from "@vis-three/middleware/object/ObjectConfig";
import { v4 } from "uuid";
import { LoadUnit } from "../../plugins/LoaderManagerPlugin";
import { Observer } from "./widget/Observer";
import { createElement, onComputed, onEvent } from "./widget/render";

const lifetimes = [
  "beforeLoad",
  "loaded",
  "beforeCreate",
  "created",
  "beforeRender",
  "rednered",
  "beforeDispose",
  "disposed",
];

export interface WigetLifetimes {
  beforeLoad?: Function;
  loaded?: Function;
  beforeCreate?: Function;
  created?: Function;
  beforeDispose?: Function;
  disposed?: Function;
}

export interface WidgetOptions {
  mixins?: Omit<WidgetOptions, "name" | "parent">[];
  name: string;
  input?: Record<string, any>;
  load?: Array<LoadUnit>;
  resources?: () => Record<string, any>;
  parent: string;
  render: (
    e: (
      type: CONFIGTYPE,
      merge: any
    ) => ReturnType<typeof CONFIGFACTORY[CONFIGTYPE]>,
    c: () => any,
    onComputed: (fun: () => any) => Symbol,
    onEvent: (fun: (event?: ObjectEvent) => void) => void,
    onResource: (url: string) => any
  ) => Record<string, ReturnType<typeof CONFIGFACTORY[CONFIGTYPE]>>;
  data?: (ignore: Ignore) => Record<string, any>;
  computed?: Record<string, () => any>;
  watch?: Record<
    string,
    | Function
    | {
        handler: Function;
        immediate: boolean;
      }
  >;
  methods?: Record<string, Function>;
  beforeLoad?: WigetLifetimes["beforeLoad"];
  loaded?: WigetLifetimes["loaded"];
  beforeCreate?: WigetLifetimes["beforeCreate"];
  created?: WigetLifetimes["created"];
  beforeDispose?: WigetLifetimes["beforeDispose"];
  disposed?: WigetLifetimes["disposed"];
  sceneChange?: Function;
  cameraChange?: Function;
}

export class Widget extends EventDispatcher {
  private static components: Record<string, WidgetOptions> = {};

  static component = function (options: WidgetOptions) {
    if (Widget.components[options.name]) {
      console.warn(`${options.name} components has exist`);
      return;
    }

    Widget.components[options.name] = options;
  };

  wid = v4();
  parent = "";
  name: string;
  observed: Record<string, any> = {};

  private options: WidgetOptions;

  private load: Array<LoadUnit> = [];
  private render?: Record<string, true> = {};
  private observer = new Observer();

  constructor(options: WidgetOptions) {
    super();
    this.options = options;
    this.name = `${options.name}-${this.wid.slice(-4)}`;
  }

  private initMixins() {
    // const mixinLoad = (mixin: Omit<WidgetOptions, 'name' | 'parent'>) => {
    //   if (mixin.load && mixin.load.length) {
    //     this.load.push(...mixin.load)
    //   }
    // }
    // const recursion = (mixins: Omit<WidgetOptions, 'name' | 'parent'>) => {
    //   if (options.mixins && options.mixins.length) {
    //     for (const mixins of options.mixins) {
    //       recursion(mixins)
    //     } else {
    //       mixinLoad()
    //     }
    //   }
    // };
    // // 从内到外覆盖
    // const options = this.options;
    // const mixins = options.mixins;
  }

  private initLifetimes() {
    const options = this.options;

    for (const key of lifetimes) {
      if (options[key]) {
        this.on(key, () => {
          options[key]();
        });
      }
    }
  }

  private async createLoad(engineSupport: EngineSupport) {
    const options = this.options;
    const resources = options.load;

    // 加载资源
    this.emit("beforeLoad");

    if (resources) {
      await engineSupport.loadResourcesAsync(resources);
    }

    this.emit("created");
  }

  // 创建Computed
  private createComputed() {
    const computed = this.options.computed || {};

    for (const key in computed) {
      this.observed[key] = onComputed(computed[key].bind(this.observed));
    }
  }

  private createRender(engineSupport: EngineSupport) {
    const render = this.options.render.call(
      this.observed,
      createElement,
      () => {},
      onComputed,
      onEvent,
      (url: string) => {
        return planish(
          handler(
            clone(engineSupport.resourceManager.getResourceConfig(url), {
              fillName: true,
            }) as EngineSupportLoadOptions,
            (config) => createElement(config.type as CONFIGTYPE, config)
          )
        );
      }
    );

    for (const key in render) {
      this.observed[key] = render[key];
      this.render![key] = true;
    }

    for (const key in this.options.resources || {}) {
      delete this.observed[key];
    }
  }

  private createObserved() {
    const options = this.options;

    const ignore = {};

    const methods = options.methods || {};

    for (const key in methods) {
      ignore[key] = true;
    }

    const data = Object.assign(
      this.observed,
      options.input,
      options.data && options.data(ignore),
      methods
    );

    options.beforeCreate && options.beforeCreate(data);

    this.observed = observable(data, ignore);
  }

  private createResources(engineSupport: EngineSupport) {
    const resources = this.options.resources;

    if (resources) {
      engineSupport.registerResources(resources.call(this.observed));
    }
  }

  // 初始观察者
  private initObserver() {
    this.observer.watch(this.observed);
    this.options.created && this.options.created.call(this.observed);
  }

  private createWatch() {
    const watch = this.options.watch || {};
    for (const wPath in watch) {
      const watcher = watch[wPath];
      let handler: Function;
      if (typeof watcher === "object") {
        if (watcher.immediate) {
          let object = this.observed;
          const walk = wPath.split(".");
          const key = walk.pop()!;
          for (const key of walk) {
            object = object[key];
          }
          const value = object[key];
          watcher.handler.call(this.observed, value);
        }
        handler = watcher.handler;
      } else {
        handler = watcher;
      }
      this.observer.subscribe((notice) => {
        const { operate, key, path, value } = notice;
        if (operate !== "get" && wPath === path) {
          handler.call(this.observed, value);
        }
      });
    }
  }

  async init(engineSupport: EngineSupport) {
    const options = this.options;

    this.initLifetimes();
    await this.createLoad(engineSupport);
    this.createObserved();
    this.createResources(engineSupport);
    this.createComputed();
    this.createRender(engineSupport);
    this.initObserver();

    this.emit("beforeRender");
    const dataSupportManager = engineSupport.dataSupportManager;
    // 打包成组
    const group = generateConfig(CONFIGTYPE.GROUP) as GroupConfig;

    Object.keys(this.render!).forEach((key) => {
      const config = this.observed[key];
      const model = getModule(config.type);
      if (!model) {
        console.warn(`widget can not support this config type: ${config.type}`);
      } else {
        // 更新parent
        if (OBJECTMODULE[model]) {
          if (!(config as ObjectConfig).parent) {
            group.children.push((config as ObjectConfig).vid);
          }
        }
        dataSupportManager.applyConfig(config);
      }
    });

    dataSupportManager.applyConfig(group);

    const scene = engineSupport.getConfigBySymbol(
      options.parent
    ) as ObjectConfig;

    scene.children.push(group.vid);

    this.parent = options.parent;

    globalAntiShake.append(() => {
      this.createWatch();
      this.emit("rendered");
      return true;
    });
  }

  exportConfig() {}

  loadConfig() {}
}
