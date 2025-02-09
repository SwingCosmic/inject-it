import { ServiceType } from "../ServiceDescription";
import { Constructor } from "type-fest";
import { DesignMetadatas, setTsParamTypes } from "./design";

/**
 * 定义一个可以自动构造函数注入的service
 * @param dependencies 手动指定注入的类型，仅在存在接口的情况下使用。不传默认会根据设计时类型信息读取
 * @returns 
 */
export function service<T extends Constructor<any>>(dependencies?: ServiceType<any>[]) {
  return function(target: T) {
    if (dependencies) {
      setTsParamTypes(dependencies, target);
    }
    return target;
  }
}

