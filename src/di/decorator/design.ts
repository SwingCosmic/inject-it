import { Constructor } from "type-fest";
import { ServiceType } from "../ServiceDescription";

export type Type = "design:type";
export type ParamTypes = "design:paramtypes";
export type ReturnType = "design:returntype";

export type DesignMetadata = Type | ParamTypes | ReturnType;

export enum DesignMetadatas {
  Type = "design:type",
  ParamTypes = "design:paramtypes",
  ReturnType = "design:returntype",
}

export function setTsType(type: ServiceType<any>, target: object){
  Reflect.defineMetadata(DesignMetadatas.Type, type, target);
}
export function setTsParamTypes(types: ServiceType<any>[], target: object) {
  Reflect.defineMetadata(DesignMetadatas.ParamTypes, types, target);
}
export function setTsReturnType(type: ServiceType<any>, target: object) {
  Reflect.defineMetadata(DesignMetadatas.ReturnType, type, target);
}
