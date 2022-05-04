import {
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
  getElementTypeListenerProperties,
} from '../common';


const ProcessGroupPropertiesArray = [
  CommonGroupProperties,

  getElementTypeListenerProperties({
    name: 'сонсогч',
  }),
  ExtensionGroupProperties,
  DocumentGroupProperties,
];

export default {

  'bpmn:Process': ProcessGroupPropertiesArray,

  'bpmn:SubProcess': ProcessGroupPropertiesArray,
};
