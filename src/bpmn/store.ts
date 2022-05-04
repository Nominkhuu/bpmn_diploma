import { reactive, toRaw, nextTick } from 'vue';
import BpmnGroupPropertiesConfig from './config';
import { resolveTypeName } from './config/TypeNameMapping';
import Modeler from 'bpmn-js/lib/Modeler';
import { BpmnState, BpmnContext, ModdleElement } from './type';

const bpmnState = reactive<BpmnState>({
  activeElement: null,
  businessObject: null,
  activeBindDefine: null,
  isActive: false,
});

function refreshState(elementRegistry: any, elementAction: any): void {
  if (!bpmnState || !elementAction) {
    return;
  }
  bpmnState.activeElement = elementAction;
  const shape = elementRegistry.get(elementAction.element.id);
  bpmnState.businessObject = shape ? shape.businessObject : {};
  bpmnState.isActive = true;
  bpmnState.activeBindDefine = shape ? BpmnGroupPropertiesConfig[elementAction.element.type] : null;
}

export const BpmnStore: BpmnContext = {
  modeler: null,
  state: bpmnState,
  getState() {
    return this.state;
  },
  initModeler(options) {
    this.modeler = new Modeler(options);
    const elementRegistry = this.modeler.get('elementRegistry');

    ['element.click', 'shape.added'].forEach((event) => {
      BpmnStore.addEventListener(event, function (elementAction) {
        // console.warn('elementAction', elementAction);
        const element = elementAction.element || elementAction.context.element;
        if (element && (!bpmnState.activeElement || bpmnState.activeElement.id !== element.id)) {
          bpmnState.businessObject = null;
          nextTick().then(() => {
            refreshState(elementRegistry, elementAction);
          });
        }
      });
    });

  },
  getModeler() {
    return this.modeler;
  },
  refresh() {
    bpmnState.businessObject = null;
    nextTick().then(() => {
      refreshState(this.modeler.get('elementRegistry'), bpmnState.activeElement);
    });
    // nextTick(() => {
    //
    // });
  },
  getShape() {
    return this.getShapeById(this.getState().activeElement.element.id);
  },
  getShapeById(id) {
    const elementRegistry = this.getModeler().get('elementRegistry');
    return elementRegistry.get(id);
  },
  getBpmnFactory() {
    return this.modeler.get('bpmnFactory');
  },
  createElement(nodeName, modelName, value, multiple) {
    const newElement = this.getBpmnFactory().create(nodeName, value);
    this.getModeling().updateProperties(this.getShape(), {
      [modelName]: multiple ? [newElement] : newElement,
    });
  },
  importXML(string) {
    return this.modeler.importXML(string);
  },
  getXML() {
    return new Promise((resolve, reject) => {
      this.getModeler()
        .saveXML({ format: true })
        .then((response: { xml: string }) => {
          resolve(response);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  },
  getSVG() {
    return new Promise((resolve, reject) => {
      this.getModeler()
        .saveSVG()
        .then((response: { svg: string }) => {
          resolve(response);
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  },
  getModeling() {
    return this.getModeler().get('modeling');
  },
  getActiveElement() {
    return this.getState().activeElement;
  },
  getActiveElementName() {
    const businessObject = this.getBusinessObject();
    return businessObject ? resolveTypeName(businessObject) : '';
  },
  getBusinessObject() {
    return this.getState().businessObject;
  },
  addEventListener(string, func) {
    this.getModeler()
      .get('eventBus')
      .on(string, function (e: any) {
        func(e);
      });
  },
  updateExtensionElements(elementName, value) {
    const moddle = this.getModeler().get('moddle');
    const element = this.getShape();
    const extensionElements = this.getBusinessObject()?.extensionElements;

    const otherExtensions =
      extensionElements?.values
        ?.filter((ex: any) => ex.$type !== elementName)
        .map((item: ModdleElement) => toRaw(item)) || [];

    const extensions = moddle.create('bpmn:ExtensionElements', {
      values: otherExtensions.concat(value instanceof Array ? value : [value]),
    });
    this.getModeling().updateProperties(element, { extensionElements: extensions });
  },
};
