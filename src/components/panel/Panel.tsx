import { defineComponent, reactive, watch } from 'vue';
import { BpmnStore } from '@/bpmn/store';
import DynamicBinder from '../../components/dynamic-binder';
import { ElCollapse, ElCollapseItem } from 'element-plus';
import { GroupProperties } from '@/bpmn/config';

import './panel.css';

export default defineComponent({
  name: 'Panel',
  setup() {
    const bpmnContext = BpmnStore;
    const contextState = bpmnContext.getState();


    function onFieldChange(key: string, value: unknown): void {
      const shape = bpmnContext.getShape();
      bpmnContext.getModeling().updateProperties(shape, { [key]: value });
    }

    const panelState = reactive({

      elCollapses: Object.assign([]),

      shrinkageOff: false,
    });

    watch(
      () => contextState.activeBindDefine,
      () => {
        if (contextState.activeBindDefine) {
          panelState.elCollapses = contextState.activeBindDefine.map((groupItem) => groupItem.name);
        }
      },
    );


    function getSlotObject(groupItem: GroupProperties) {
      return {
        title: () => (
          <div class="group-title-block">
            {groupItem.icon && <i class={groupItem.icon} />}
            {groupItem.name}
          </div>
        ),
        default: () => (
          <DynamicBinder
            {...{ onFieldChange: onFieldChange }}
            fieldDefine={groupItem.properties}
            v-model={contextState.businessObject}
          />
        ),
      };
    }

    return () => (
      <>
        {contextState.isActive && contextState.businessObject && contextState.activeBindDefine && (
          <>
            <div
              class="bpmn-panel-shrinkage"
              onClick={() => (panelState.shrinkageOff = !panelState.shrinkageOff)}
            >
              {panelState.shrinkageOff ? (
                <i class="el-icon-s-fold" />
              ) : (
                <i class="el-icon-s-unfold" />
              )}
            </div>
            <div class="bpmn-panel" v-show={!panelState.shrinkageOff}>
              <div class="title">{bpmnContext.getActiveElementName()}</div>
              <ElCollapse class="bpmn-panel-collapse" v-model={panelState.elCollapses}>
                {contextState.activeBindDefine.map((groupItem) => {
                  return (
                    <ElCollapseItem name={groupItem.name} v-slots={getSlotObject(groupItem)} />
                  );
                })}
              </ElCollapse>
            </div>
          </>
        )}
      </>
    );
  },
});
