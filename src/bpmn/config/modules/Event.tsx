import {
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
  FormGroupProperties,
} from '../common';

const CommonGroupPropertiesArray = [
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
];

export default {
  'bpmn:StartEvent': [
    CommonGroupProperties,
    FormGroupProperties,
    ExtensionGroupProperties,
    DocumentGroupProperties,
  ],
  'bpmn:EndEvent': CommonGroupPropertiesArray,
  'bpmn:IntermediateThrowEvent': CommonGroupPropertiesArray,
  'bpmn:IntermediateCatchEvent': CommonGroupPropertiesArray,
};
