import {
  CommonGroupProperties,
  FormGroupProperties,
  DocumentGroupProperties,
  ExtensionGroupProperties,
  getElementTypeListenerProperties,
} from '../common';
import { GroupProperties } from '../index';
import PrefixLabelSelect from '@/components/prefix-label-select';
import { ElInput, ElOption } from 'element-plus';
import { ModdleElement } from '../../type';
import { BpmnStore } from '../../store';

const TASK_EVENT_OPTIONS = [
  { label: 'Үүсгэх', value: 'create' },
  { label: 'Бүртгэх', value: 'assignment' },
  { label: 'Дууссан', value: 'complete' },
  { label: 'Устгах', value: 'delete' },
  { label: 'Бүгд', value: 'all' },
];

const TaskListenerProperties = getElementTypeListenerProperties({
  name: 'даалгавар',
  eventOptions: TASK_EVENT_OPTIONS,
});

const USER_OPTIONS = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
];

const UserOption: JSX.Element = (
  <>
    {USER_OPTIONS.map((item) => {
      return <ElOption {...item} />;
    })}
  </>
);


export const BpmnUserGroupProperties: GroupProperties = {
  name: 'Ажилын тохиргоо',
  icon: 'el-icon-user-solid',
  properties: {

    assignee: {
      component: PrefixLabelSelect,
      prefixTitle: 'зохицуулагч',
      allowCreate: true,
      filterable: true,
      vSlots: {
        default: (): JSX.Element => UserOption,
      },
    },

    candidateUsers: {
      component: PrefixLabelSelect,
      prefixTitle: 'Prefix',
      filterable: true,
      multiple: true,
      allowCreate: true,
      vSlots: {
        default: (): JSX.Element => UserOption,
      },
      getValue(businessObject: ModdleElement): string {
        console.warn('businessObject', businessObject);

        return 'string' === typeof businessObject.candidateUsers
          ? businessObject.candidateUsers.split(',')
          : businessObject.candidateUsers;
      },
    },

    loopCardinality: {
      component: ElInput,
      placeholder: 'Суурь',
      type: 'number',
      vSlots: {
        prepend: (): JSX.Element => <div>循环基数</div>,
      },
      predicate(businessObject: ModdleElement): boolean {
        return businessObject.loopCharacteristics;
      },
      getValue(businessObject: ModdleElement): string {
        const loopCharacteristics = businessObject.loopCharacteristics;
        if (!loopCharacteristics) {
          return '';
        }
        return loopCharacteristics.loopCardinality?.body;
      },
      setValue(businessObject: ModdleElement, key: string, value: string): void {
        const bpmnContext = BpmnStore;
        const moddle = bpmnContext.getModeler().get('moddle');
        const loopCharacteristics = businessObject.loopCharacteristics;
        loopCharacteristics.loopCardinality = moddle.create('bpmn:FormalExpression', {
          body: value,
        });
        bpmnContext.getModeling().updateProperties(bpmnContext.getShape(), {
          loopCharacteristics: loopCharacteristics,
        });
      },
    },

    completionCondition: {
      component: ElInput,

      placeholder:
      'Жишээ нь: ${nrOfCompletedInstances/nrOfInstances >= 0.25} нь гүйцэтгэлийн тоо 4 минут, 1-ээс их буюу тэнцүү байх үед даалгавар дууссан гэсэн үг',
      vSlots: {
        prepend: (): JSX.Element => <div>完成条件</div>,
      },
      predicate(businessObject: ModdleElement): boolean {
        return businessObject.loopCharacteristics;
      },
      getValue(businessObject: ModdleElement): string {
        const loopCharacteristics = businessObject.loopCharacteristics;
        if (!loopCharacteristics) {
          return '';
        }
        return loopCharacteristics.completionCondition?.body;
      },
      setValue(businessObject: ModdleElement, key: string, value: string): void {
        const bpmnContext = BpmnStore;
        const moddle = bpmnContext.getModeler().get('moddle');
        const loopCharacteristics = businessObject.loopCharacteristics;
        loopCharacteristics.completionCondition = moddle.create('bpmn:FormalExpression', {
          body: value,
        });
        bpmnContext.getModeling().updateProperties(bpmnContext.getShape(), {
          loopCharacteristics: loopCharacteristics,
        });
      },
    },
  },
};

const LOOP_OPTIONS = [
  { label: 'хоосон', value: 'Null' },
  { label: 'Параллел явдал', value: 'Parallel' },
  { label: 'аг хугацааны цуврал', value: 'Sequential' },
  { label: 'давтагдах үйл явдлууд', value: 'StandardLoop' },
];

const LoopOptions: JSX.Element = (
  <>
    {LOOP_OPTIONS.map((item) => {
      return <ElOption {...item} />;
    })}
  </>
);

const BaseTaskProperties = {
  ...CommonGroupProperties,
  properties: {
    ...CommonGroupProperties.properties,
    loopCharacteristics: {
      component: PrefixLabelSelect,
      prefixTitle: 'Хэлхээний шинж чанар',
      vSlots: {
        default: (): JSX.Element => LoopOptions,
      },
      getValue(businessObject: ModdleElement): string {
        const loopCharacteristics = businessObject.loopCharacteristics;
        if (!loopCharacteristics) {
          return 'Null';
        }

        if (loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
          return loopCharacteristics.isSequential ? 'Sequential' : 'Parallel';
        } else {
          return 'StandardLoop';
        }
      },
      setValue(businessObject: ModdleElement, key: string, value: string): () => void {
        const shape = BpmnStore.getShape();
        const modeling = BpmnStore.getModeling();
        switch (value) {
          case 'Null':
            modeling.updateProperties(shape, {
              loopCharacteristics: null,
            });
            // delete businessObject.loopCharacteristics;
            break;
          case 'StandardLoop':
            BpmnStore.createElement('bpmn:StandardLoopCharacteristics', 'loopCharacteristics');
            break;
          default:
            BpmnStore.createElement(
              'bpmn:MultiInstanceLoopCharacteristics',
              'loopCharacteristics',
              {
                isSequential: value === 'Sequential',
              },
            );
        }
        return () => BpmnStore.refresh();
      },
    },
  },
};

const CommonGroupPropertiesArray = [
  BaseTaskProperties,
  TaskListenerProperties,
  ExtensionGroupProperties,
  DocumentGroupProperties,
];

export default {

  'bpmn:Task': CommonGroupPropertiesArray,

  'bpmn:UserTask': [
    BaseTaskProperties,
    BpmnUserGroupProperties,
    TaskListenerProperties,
    FormGroupProperties,
    ExtensionGroupProperties,
    DocumentGroupProperties,
  ],

  'bpmn:ReceiveTask': CommonGroupPropertiesArray,

  'bpmn:SendTask': CommonGroupPropertiesArray,

  'bpmn:ManualTask': CommonGroupPropertiesArray,

  'bpmn:BusinessRuleTask': CommonGroupPropertiesArray,

  'bpmn:ServiceTask': CommonGroupPropertiesArray,

  'bpmn:ScriptTask': CommonGroupPropertiesArray,

  'bpmn:CallActivity': CommonGroupPropertiesArray,
};
