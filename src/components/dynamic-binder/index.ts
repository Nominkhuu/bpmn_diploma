import { Component } from 'vue';
import DynamicBinder from './DynamicBinder';


export interface FieldDefine extends Map {

  predicate?: string | ((obj: any) => boolean);
  component?: string | Component | JSX.Element;

  getValue?: (sourceObject: any) => any;
  setValue?: (sourceObject: any, key: string, value: any) => void | (() => void);
}

export interface Map {
  [key: string]: any;

  [index: number]: any;
}

export default DynamicBinder;
