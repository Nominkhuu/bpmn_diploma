import { FieldDefine } from '@/components/dynamic-binder';


export interface PropertiesMap<T> {
  [key: string]: T;
}


export interface GroupProperties {
  name?: string;
  icon?: string;
  properties: PropertiesMap<FieldDefine>;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const modules = import.meta.glob('./modules/*.tsx');
const getBpmnGroupPropertiesConfig = () => {
  const BpmnGroupPropertiesConfig: PropertiesMap<Array<GroupProperties>> = {};
  for (const path in modules) {
    modules[path]().then((mod: any) => {
      const moduleDefuatlExport = mod.default;
      for (const moduleKey in moduleDefuatlExport) {
        BpmnGroupPropertiesConfig[moduleKey] = moduleDefuatlExport[moduleKey];
      }
    });
  }
  return BpmnGroupPropertiesConfig;
};

export default getBpmnGroupPropertiesConfig();
