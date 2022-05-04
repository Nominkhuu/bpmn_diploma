
import { UnwrapRef } from 'vue';
import Modeler from 'bpmn-js/lib/Modeler';
import { GroupProperties } from './config';

export interface BpmnState {

  activeElement: any;

  businessObject: any;

  isActive: boolean;


  activeBindDefine: Array<GroupProperties> | null | never;
}

export interface ModdleElement {
  id: string;
  $type: string;
  value?: [ModdleElement];
  $attrs: { [key: string]: any };

  [key: string]: any;
}

export interface BpmnContext {

  modeler: any;

  state: UnwrapRef<BpmnState>;

  getState(): UnwrapRef<BpmnState>;

  refresh: () => void;


  initModeler(options: unknown): void;


  getModeler(): typeof Modeler;


  importXML(xml: string): Promise<Array<string> | any>;


  getXML(): Promise<{ xml: string }>;


  getSVG(): Promise<{ svg: string }>;


  getShape(): any;

  getShapeById(id: string): any;


  getBusinessObject(): any;


  getActiveElement(): any;


  getActiveElementName(): string;


  getModeling(): any;


  getBpmnFactory(): any;


  createElement(
    nodeName: string,
    modelName: string,
    value?: { [key: string]: any } | never,
    multiple?: boolean,
  ): void;


  addEventListener(name: string, func: (e: any) => void): void;


  updateExtensionElements(elementName: string, value: ModdleElement | Array<ModdleElement>): void;
}
