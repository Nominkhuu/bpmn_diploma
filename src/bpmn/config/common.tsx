import { ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus';
import { FieldDefine } from '@/components/dynamic-binder';
import { PropertiesMap, GroupProperties } from './index';
import SubList from '../../components/sublist/SubList';
import { SubListState } from '@/components/sublist/type';
import { ModdleElement } from '../type';
import { BpmnStore } from '../store';


const commonProperties: PropertiesMap<FieldDefine> = {
  id: {
    component: ElInput,
    placeholder: 'ID',
    vSlots: {
      prepend: (): JSX.Element => <div>ID</div>,
    },
    setValue(sourceObject: ModdleElement, key: string, value: string) {
      const isNotNull = value;
      const latestValue = value || ' ';
      const shape = BpmnStore.getShape();
      BpmnStore.getModeling().updateProperties(shape, {
        [key]: isNotNull ? latestValue.trim() : latestValue,
      });
    },
  },
  name: {
    component: ElInput,
    placeholder: 'нэр',
    vSlots: {
      prepend: (): JSX.Element => <div>Нэр</div>,
    },
  },
};


export const CommonGroupProperties: GroupProperties = {
  name: 'Үндсэн',
  icon: 'el-icon-info',
  properties: { ...commonProperties },
};

interface Documentation {
  text: string;
}

export const DocumentGroupProperties: GroupProperties = {
  name: 'баримт бичиг',
  icon: 'el-icon-document',
  properties: {
    'documentation.text': {
      component: ElInput,
      type: 'textarea',
      getValue: (obj: { documentation: Array<Documentation> }): string => {
        return obj['documentation']?.[0]?.['text'];
      },
      setValue(businessObject: ModdleElement, key: string, value: unknown): void {
        BpmnStore.createElement('bpmn:Documentation', 'documentation', { text: value }, true);
      },
    },
  },
};

interface PropertyElement {
  $type: string;
  name: string;
  value: unknown;
}

const EVENT_OPTIONS = [
  { label: 'Эхлэх', value: 'start' },
  { label: 'Дуусах', value: 'end' },
];


const TYPE_OPTIONS = [
  { label: 'java класс', value: 'class' },
  { label: 'илэрхийлэл', value: 'expression' },
  { label: 'илэрхийлэл', value: 'delegateExpression' },
];

import { TaskNameMapping } from './TypeNameMapping';

const taskTags = Object.keys(TaskNameMapping);
export const getElementTypeListenerProperties = function (options: {
  name: string;
  icon?: string;

  eventOptions?: Array<{ label: string; value: string }>;
}): GroupProperties {
  const eventOptions = options.eventOptions || EVENT_OPTIONS;
  return {
    name: options.name || 'Ажиглах',
    icon: options.icon || 'el-icon-bell',
    properties: {
      'extensionElements.listeners': {
        component: SubList,
        columns: [
          {
            type: 'index',
            label: 'серийн дугаар',
            align: 'center',
          },
          {
            prop: 'event',
            label: 'үйл явдал',
            align: 'center',
            formatter: (row: any, column: any): string => {
              return eventOptions.filter((item) => item.value === row[column.property])[0].label;
            },
            editComponent: function (scope: any, state: SubListState<any>): JSX.Element {
              return (
                <ElFormItem
                  size="mini"
                  class="sublist-form-item"
                  label={scope.column.name}
                  prop={scope.column.property}
                >
                  <ElSelect v-model={state.editItem.event}>
                    {eventOptions.map((option) => {
                      return (
                        <ElOption key={option.value} label={option.label} value={option.value} />
                      );
                    })}
                  </ElSelect>
                </ElFormItem>
              );
            },
          },
          {
            prop: 'type',
            label: 'гүйцэтгэлийн төрөл',
            align: 'center',
            formatter: (row: any, column: any) => {
              return TYPE_OPTIONS.filter((item) => item.value === row[column.property])[0].label;
            },
            editComponent: function (scope: any, state: SubListState<any>): JSX.Element {
              return (
                <ElFormItem
                  size="mini"
                  class="sublist-form-item"
                  label={scope.column.name}
                  prop={scope.column.property}
                >
                  <ElSelect v-model={state.editItem.type}>
                    {TYPE_OPTIONS.map((option) => {
                      return (
                        <ElOption key={option.value} label={option.label} value={option.value} />
                      );
                    })}
                  </ElSelect>
                </ElFormItem>
              );
            },
          },
          {
            prop: 'content',
            label: 'агуулга',
            align: 'center',
          },
        ],
        rules: {
          event: [{ required: true, message: 'үйл явдал хоосон байж болохгүй' }],
          type: [{ required: true, message: 'Төрөл нь null байж болохгүй' }],
          content: [{ required: true, message: 'Гүйцэтгэлийн агуулга хоосон байж болохгүй' }],
        },
        getValue: (businessObject: ModdleElement): Array<any> => {
          const listenerTagName = taskTags.includes(businessObject.$type)
            ? 'activiti:TaskListener'
            : 'activiti:ExecutionListener';
          return businessObject?.extensionElements?.values
            ?.filter((item: ModdleElement) => item.$type === listenerTagName)
            ?.map((item: ModdleElement) => {
              const type = item.expression
                ? 'expression'
                : item.delegateExpression
                ? 'delegateExpression'
                : 'class';
              return {
                event: item.event,
                type: type,
                content: item[type],
              };
            });
        },
        setValue(businessObject: ModdleElement, key: string, value: []): void {
          const bpmnContext = BpmnStore;
          console.warn('activeBusinessObject', businessObject);
          const moddle = bpmnContext.getModeler().get('moddle');
          const listenerTagName = taskTags.includes(businessObject.$type)
            ? 'activiti:TaskListener'
            : 'activiti:ExecutionListener';
          bpmnContext.updateExtensionElements(
            listenerTagName,
            value.map((attr: { event: string; type: string; content: string }) => {
              return moddle.create(listenerTagName, {
                event: attr.event,
                [attr.type]: attr.content,
              });
            }),
          );
        },
      },
    },
  };
};


export const ExtensionGroupProperties: GroupProperties = {
  name: 'Өргөтгөсөн шинж чанарууд',
  icon: 'el-icon-document-add',
  properties: {
    'extensionElements.properties': {
      component: SubList,
      columns: [
        {
          type: 'index',
          label: 'серийн дугаар',
          align: 'center',
        },
        {
          prop: 'name',
          label: 'нэр',
          align: 'center',
        },
        {
          prop: 'value',
          label: 'value',
          align: 'center',
        },
      ],
      rules: {
        name: [{ required: true, message: 'Үл хөдлөх хөрөнгийн нэр хоосон байж болохгүй' }],
        value: [{ required: true, message: 'Үл хөдлөх хөрөнгийн үнэ цэнэ хоосон байж болохгүй' }],
      },
      getValue: (businessObject: ModdleElement): Array<any> => {
        return businessObject?.extensionElements?.values
          ?.filter((item: PropertyElement) => item.$type === 'activiti:Properties')[0]
          ?.values.map((item: PropertyElement) => ({
            name: item.name,
            value: item.value,
          }));
      },
      setValue(businessObject: ModdleElement, key: string, value: []): void {
        const bpmnContext = BpmnStore;
        const moddle = bpmnContext.getModeler().get('moddle');
        const properties = moddle.create(`activiti:Properties`, {
          values: value.map((attr: { name: string; value: unknown }) => {
            return moddle.create(`activiti:Property`, { name: attr.name, value: attr.value });
          }),
        });
        bpmnContext.updateExtensionElements('activiti:Properties', properties);
      },
    },
  },
};

interface FromPropertyElement {
  $type: string;
  id: string;
  type: string;
  $attrs: FromPropertyAttrsElement;
}

interface FromPropertyAttrsElement {
  name: string;
}


export const FormGroupProperties: GroupProperties = {
  name: 'маягтын мэдээлэл',
  icon: 'el-icon-edit',
  properties: {
    formKey: {
      component: ElInput,
      placeholder: 'key',
      vSlots: {
        prepend: (): JSX.Element => <div>表单key</div>,
      },
    },
    'extensionElements.formProperty': {
      component: SubList,
      columns: [
        {
          prop: 'id',
          label: 'id',
          align: 'center',
        },
        {
          prop: 'type',
          label: 'төрөл',
          align: 'center',
        },
        {
          prop: 'name',
          label: 'нэр',
          align: 'center',
        },
      ],
      rules: {
        id: [{ required: true, message: 'id хоосон байж болохгүй为空' }],
        type: [{ required: true, message: 'Төрөл нь null байж болохгүй' }],
        name: [{ required: true, message: 'Нэрийг оруулах шаардлагатай' }],
      },
      getValue: (businessObject: ModdleElement): Array<FromPropertyElement> => {
        return businessObject?.extensionElements?.values
          ?.filter((item: FromPropertyElement) => item.$type === 'activiti:FormProperty')
          .map((elem: FromPropertyElement) => {
            console.warn('elem', elem);
            return { id: elem?.id, type: elem.type, name: elem?.$attrs?.name };
          });
      },
      setValue(businessObject: ModdleElement, key: string, value: []): void {
        const bpmnContext = BpmnStore;
        const moddle = bpmnContext.getModeler().get('moddle');
        const formProperties = value.map((attr: { id: string; type: string; name: string }) => {
          return moddle.create('activiti:FormProperty', {
            id: attr.id,
            name: attr.name,
            type: attr.type,
          });
        });

        bpmnContext.updateExtensionElements('activiti:FormProperty', formProperties);
      },
    },
  },
};