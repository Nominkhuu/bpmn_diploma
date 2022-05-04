import {
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
} from '../common';

const CommonGroupPropertiesArray = [
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
];

export default {

  'bpmn:ExclusiveGateway': CommonGroupPropertiesArray,
  'bpmn:ParallelGateway': CommonGroupPropertiesArray,

  'bpmn:ComplexGateway': CommonGroupPropertiesArray,

  'bpmn:EventBasedGateway': CommonGroupPropertiesArray,
};
