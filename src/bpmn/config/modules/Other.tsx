import {
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
} from '../common';
import { ElInput } from 'element-plus';

const CommonGroupPropertiesArray = [
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
];

interface CategoryValueRef {
  value: string;
}

const BpmnGroupBaseProperties = {
  name: 'Үндсэн мэдээлэл',
  icon: 'el-icon-info',
  properties: {
    id: {
      component: ElInput,
      placeholder: 'ID',
      vSlots: {
        prepend: (): JSX.Element => <div>节点ID</div>,
      },
    },
    name: {
      component: ElInput,

      placeholder: 'зангилааны нэр',
      vSlots: {
        prepend: (): JSX.Element => <div>зангилааны нэр</div>,
      },
      getValue: (obj: { categoryValueRef: CategoryValueRef }): string => {
        return obj?.categoryValueRef?.value;
      },
    },
  },
};

export default {

  'bpmn:Participant': CommonGroupPropertiesArray,

  'bpmn:Group': [BpmnGroupBaseProperties, ExtensionGroupProperties, DocumentGroupProperties],

  'bpmn:DataStoreReference': CommonGroupPropertiesArray,

  'bpmn:DataObjectReference': CommonGroupPropertiesArray,
};
