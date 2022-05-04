
import { ModdleElement } from '../type';

export const ProcessNameMapping = {
  //流程
  'bpmn:Process': 'үйл явц',
  //子流程
  'bpmn:SubProcess': 'дэд процесс',
};

// 事件名字匹配
export const EventNameMapping = {
  'bpmn:StartEvent': 'Эхлүүлэх',
  'bpmn:EndEvent': 'Дуусгах',
  'bpmn:MessageEventDefinition': 'мэдээлэл',
  'bpmn:TimerEventDefinition': 'хугацаа',
  'bpmn:ConditionalEventDefinition': 'нөхцөл',
  'bpmn:SignalEventDefinition': 'Дохио',
};

//流名称匹配
export const FlowNameMapping = {
  'bpmn:SequenceFlow': (businessObject: ModdleElement) => {
    const defaultName = 'урсгал';
    if (businessObject.conditionExpression) {
      return 'нөхцөл' + defaultName;
    }

    if (businessObject.sourceRef.default) {
      return 'анхдагч' + defaultName;
    }

    return defaultName;
  },
};

export const GatewayNameMapping = {

  'bpmn:ExclusiveGateway': 'харилцан онцгой гарц',

  'bpmn:ParallelGateway': 'Зэрэгцээ гарц',

  'bpmn:ComplexGateway': 'цогц гарц',

  'bpmn:EventBasedGateway': 'үйл явдлын гарц',
};


export const TaskNameMapping = {
  'bpmn:Task': 'нийтлэг даалгавар',
  'bpmn:UserTask': 'Хэрэглэгчийн даалгавар',
  'bpmn:ReceiveTask': 'даалгавар хүлээн авах',
  'bpmn:SendTask': 'даалгавар илгээх',
  'bpmn:ManualTask': 'гарын авлагын даалгавар',
  'bpmn:BusinessRuleTask': 'бизнесийн дүрмийн даалгавар',
  'bpmn:ServiceTask': 'үйлчилгээний даалгавар',
  'bpmn:ScriptTask': 'скрипт даалгавар',
  'bpmn:CallActivity': 'дуудлагын даалгавар',
};


export const OtherNameMapping = {

  'bpmn:Participant': 'Оролцогч',
  'bpmn:Group': 'бүлэглэх',
  'bpmn:DataStoreReference': 'өгөгдөл хадгалах',
  'bpmn:DataObjectReference': 'өгөгдлийн объект',
};

export const NameMapping: { [key: string]: ((obj: any) => string) | string } = {
  ...ProcessNameMapping,
  ...EventNameMapping,
  ...FlowNameMapping,
  ...GatewayNameMapping,
  ...TaskNameMapping,
  ...OtherNameMapping,
};

export const resolveTypeName = (businessObject: ModdleElement): string => {
  const eventDefinitions = businessObject.eventDefinitions;
  const nameMappingElement = NameMapping[businessObject.$type];
  if (typeof nameMappingElement === 'function') {
    return nameMappingElement(businessObject);
  }
  return eventDefinitions
    ? NameMapping[eventDefinitions[0].$type] + nameMappingElement
    : nameMappingElement;
};
