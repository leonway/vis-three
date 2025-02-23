import { Object3D } from "three";
import { MODULETYPE } from "../constants";
import { DataSupport, Rule } from "../module";
import { ObjectCompiler } from "./ObjectCompiler";
import { ObjectConfig } from "./ObjectConfig";

export type BasicObjectDataSupport = ObjectDataSupport<
  ObjectConfig,
  Object3D,
  ObjectCompiler<ObjectConfig, Object3D>
>;

export class ObjectDataSupport<
  C extends ObjectConfig,
  O extends Object3D,
  P extends ObjectCompiler<C, O>
> extends DataSupport<C, O, P> {
  MODULE: MODULETYPE = MODULETYPE.GROUP;

  constructor(rule: Rule<P>, data: Array<C> = []) {
    super(rule, data);
  }
}
