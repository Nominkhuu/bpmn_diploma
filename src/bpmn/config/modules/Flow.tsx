import {
  CommonGroupProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
  getElementTypeListenerProperties,
} from '../common';

import { ElInput, ElOption } from 'element-plus';
import PrefixLabelSelect from '../../../components/prefix-label-select';
import { ModdleElement } from '../../type';
import { BpmnStore } from '../../store';

const FLOW_TYPE_OPTIONS = [
  { label: 'Энгийн', value: 'normal' },
  { label: 'үндсэн', value: 'default' },
  { label: 'нөхцөлт', value: 'condition' },
];


const getSequenceFlowType = (businessObject: ModdleElement) => {
  if (businessObject?.conditionExpression) {
    return 'condition';
  }

  if (businessObject?.sourceRef?.default) {
    return 'default';
  }

  return 'normal';
};


const BaseProperties = {
  ...CommonGroupProperties,
  properties: {
    ...CommonGroupProperties.properties,

    'sequenceFlow.type': {
      component: PrefixLabelSelect,
      prefixTitle: 'дарааллын урсгалын төрөл',
      predicate: (businessObject: ModdleElement): boolean => {
        return businessObject?.sourceRef?.$type !== 'bpmn:StartEvent';
      },
      vSlots: {
        default: (): JSX.Element => (
          <>
            {FLOW_TYPE_OPTIONS.map((item) => {
              return <ElOption {...item} />;
            })}
          </>
        ),
      },
      getValue(businessObject: ModdleElement): string {
        return getSequenceFlowType(businessObject);
      },
      setValue(businessObject: ModdleElement, key: string, value: string): void {
        const bpmnContext = BpmnStore;
        const line = bpmnContext.getShape();
        const sourceShape = bpmnContext
          .getModeler()
          .get('elementRegistry')
          .get(line.businessObject.sourceRef.id);
        const modeling = bpmnContext.getModeling();
        if (!value || value === 'normal') {
          modeling.updateProperties(line, { conditionExpression: null });
          delete line.businessObject.conditionExpression;
        }

        if (value === 'default') {
          modeling.updateProperties(sourceShape, { default: line });
          delete line.businessObject.conditionExpression;
        }

        if (value === 'condition') {
          modeling.updateProperties(line, {
            conditionExpression: bpmnContext
              .getModeler()
              .get('moddle')
              .create('bpmn:FormalExpression'),
          });
        }
      },
    },
    'conditionExpression.body': {
      component: ElInput,
      placeholder: 'нөхцөлт илэрхийлэл',
      vSlots: {
        prepend: (): JSX.Element => <div>条件表达式</div>,
      },
      predicate: (businessObject: ModdleElement): boolean => {
        return 'condition' === getSequenceFlowType(businessObject);
      },
      getValue(businessObject: ModdleElement): string {
        return businessObject?.conditionExpression?.body;
      },
      setValue(businessObject: ModdleElement, key: string, value: unknown): void {
        const bpmnContext = BpmnStore;
        const moddle = bpmnContext.getModeler().get('moddle');
        bpmnContext.getModeling().updateProperties(bpmnContext.getShape(), {
          conditionExpression: moddle.create('bpmn:FormalExpression', { body: value }),
        });
      },
    },
  },
};

export default {
  'bpmn:SequenceFlow': [
    BaseProperties,
    getElementTypeListenerProperties({
      name: 'нөхцөлт урсгал',
      eventOptions: [{ label: 'take', value: 'take' }],
    }),
    ExtensionGroupProperties,
    DocumentGroupProperties,
  ],
};
