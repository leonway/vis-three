import { Compiler, CompilerTarget } from "../compiler";
import { Rule } from "../rule";
import { Translater } from "../translater";
import { ProxyNotice, DataContainer } from "../dataContainer";
import { SymbolConfig } from "../../common";
import { CONFIGFACTORY, MODULETYPE } from "../../constants";
import { valueOf } from "@vis-three/utils";
import { JSONHandler } from "../../utils";

export abstract class DataSupport<
  C extends SymbolConfig,
  O extends object,
  P extends Compiler<C, O>
> {
  abstract MODULE: MODULETYPE;

  private dataContainer = new DataContainer<C>();
  private translater: Translater<C, O, P>;
  constructor(rule: Rule<P>, data: Array<C> = []) {
    this.translater = new Translater<C, O, P>().setRule(rule);

    this.dataContainer.subscribe((notice: ProxyNotice) => {
      this.translater.translate(notice);
    });

    for (const config of data) {
      this.addConfig(config);
    }
  }

  getData(): CompilerTarget<C> {
    return this.dataContainer.container;
  }

  existSymbol(vid: string): boolean {
    return Boolean(this.dataContainer.container[vid]);
  }

  addConfig(config: valueOf<CompilerTarget<C>>): this {
    this.dataContainer.container[config.vid as keyof CompilerTarget<C>] =
      config;
    return this;
  }

  getConfig(vid: string) {
    return this.dataContainer.container[vid];
  }

  removeConfig(vid: string) {
    const data = this.dataContainer.container;
    data[vid] !== undefined && delete data[vid];
  }

  addCompiler(compiler: P): this {
    compiler.setTarget(this.dataContainer.container);
    compiler.compileAll();
    this.translater.apply(compiler);
    return this;
  }

  /**
   * 导出json化配置单
   * @returns json config
   */
  toJSON(compress = true): string {
    if (!compress) {
      return JSON.stringify(
        Object.values(this.dataContainer.container),
        JSONHandler.stringify
      );
    } else {
      return JSON.stringify(this.exportConfig(), JSONHandler.stringify);
    }
  }

  /**
   * 导出配置单
   * @param compress 是否压缩配置单 default true
   * @returns config
   */
  exportConfig(compress = true): Array<C> {
    if (!compress) {
      return Object.values(JSONHandler.clone(this.dataContainer.container));
    } else {
      const data = this.dataContainer.container;
      const target: Array<C> = [];
      const cacheConfigTemplate: { [key: string]: SymbolConfig } = {};

      const recursion = (
        config: object,
        template: object,
        result: object = {}
      ) => {
        for (const key in config) {
          if (["vid", "type"].includes(key)) {
            result[key] = config[key];
            continue;
          }

          if (typeof config[key] === "object" && config[key] !== null) {
            // 数组处理
            if (Array.isArray(config[key])) {
              if (!config[key].length) {
                continue;
              }

              result[key] = config[key].map((elem) => {
                if (typeof elem === "object" && elem !== null) {
                  return JSONHandler.clone(elem);
                } else {
                  return elem;
                }
              });
              continue;
            }
            // 对象处理
            result[key] = {};
            // 扩展对象
            if (!template[key]) {
              result[key] = JSONHandler.clone(config[key]);
            } else {
              recursion(config[key], template[key], result[key]);
              if (Object.keys(result[key]).length === 0) {
                delete result[key];
              }
            }
          } else {
            if (template[key] !== config[key]) {
              result[key] = config[key];
            }
          }
        }
      };

      for (const config of Object.values(data)) {
        if (!cacheConfigTemplate[config.type]) {
          if (!CONFIGFACTORY[config.type]) {
            console.error(`can not font some config with: ${config.type}`);
            continue;
          }
          cacheConfigTemplate[config.type] = CONFIGFACTORY[config.type]();
        }
        const temp = {} as C;
        recursion(config, cacheConfigTemplate[config.type], temp);
        target.push(temp);
      }
      return target;
    }
  }

  /**
   * 加载配置
   * @param configs this module configs
   * @returns true
   */
  load(configs: Array<C>): this {
    const data = this.dataContainer.container;

    const cacheConfigTemplate: { [key: string]: SymbolConfig } = {};
    const restore = (config: object, template: object) => {
      for (const key in template) {
        if (
          typeof config[key] === "object" &&
          config[key] !== null &&
          typeof template[key] === "object" &&
          template[key] !== null
        ) {
          restore(config[key], template[key]);
        } else if (config[key] === undefined) {
          config[key] = template[key];
        }
      }
    };

    for (const config of configs) {
      if (!cacheConfigTemplate[config.type]) {
        if (!CONFIGFACTORY[config.type]) {
          console.error(`can not font some config with: ${config.type}`);
          continue;
        }
        cacheConfigTemplate[config.type] = CONFIGFACTORY[config.type]();
      }
      restore(config, cacheConfigTemplate[config.type]);
      data[config.vid] = config;
    }

    return this;
  }

  remove(configs: Array<C>): this {
    const data = this.dataContainer.container;
    for (const config of configs) {
      data[config.vid] !== undefined && delete data[config.vid];
    }
    return this;
  }

  getModule(): MODULETYPE {
    return this.MODULE;
  }
}
