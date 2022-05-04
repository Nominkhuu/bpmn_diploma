import { defineComponent, PropType, reactive, watch, ref, onMounted, toRaw } from 'vue';
import { ElInput, ElTable, ElTableColumn, ElForm, ElFormItem } from 'element-plus';
import { TableProps } from 'element-plus/lib/el-table/src/table/defaults';
import { TableColumn, SubListState } from './type';
import './sublist.css';
import { SetupContext } from '@vue/runtime-core';


const deepCopy = (prototype: any): typeof prototype => {
  return JSON.parse(JSON.stringify(prototype));
};

export default defineComponent({
  props: {

    modelValue: {
      type: Array,
      default: () => [],
      required: true,
    },

    columns: {
      type: Array as PropType<Array<TableColumn>>,
      required: true,
    },

    model: {
      type: Object as PropType<{ [key: string]: string }>,
      default: () => Object.assign({}),
    },
    rules: {
      type: Object as PropType<{ [key: string]: Array<ObjectConstructor> }>,
      default: () => null,
    },

    tableProps: {
      type: Object as PropType<TableProps<any>>,
      default: () => ({
        stripe: true,
        border: true,
        size: 'small',
        'empty-text': 'өгөгдөл алга',
      }),
    },

    addTitle: {
      type: String as PropType<string>,
      default: () => '+ д нэмэх',
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const sublistState: SubListState<any> = reactive({
      data: props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [],
      editing: false,
      editItem: {},
      editIndex: undefined,
      isNew: false,
      sublistForm: null,
    });

    // SubList
    const form = ref();
    onMounted(() => {
      sublistState.sublistForm = form.value;
    });

    const restoreState = () => {
      sublistState.data = props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : [];
      sublistState.editing = false;
      sublistState.editItem = undefined;
      sublistState.editIndex = undefined;
      sublistState.isNew = false;
    };

    watch(
      () => props.modelValue,
      () => {
        restoreState();
      },
    );


    const addData = (): void => {
      sublistState.data.push(deepCopy(props.model));
      sublistState.editIndex = sublistState.data.length - 1;
      sublistState.editing = true;
      sublistState.editItem = deepCopy(deepCopy(props.model));
      sublistState.isNew = true;
    };


    const actionColumnProps = buildActionColumnProps(sublistState, ctx);
    return {
      sublistState,
      addData,
      form,
      actionColumnProps,
    };
  },
  render() {
    const props = this.$props;
    const sublistState = this.sublistState;
    const tableProps = deepCopy(props.tableProps);

    const formProps = {
      size: 'mini',
      inline: true,
      'inline-message': true,
      'show-message': true,
      rules: props.rules,
      model: sublistState.editItem,
    };
    return (
      <div class="sublist-div">
        {sublistState.data && (
          <ElForm ref="form" {...formProps}>
            <ElTable {...tableProps} data={sublistState.data}>
              {props.columns.map((column) => {
                const rawColum = toRaw(column);
                if (sublistState.editing && rawColum.type !== 'index') {
                  const editComponentBuilder = rawColum.editComponent || getDefaultEditComponent();
                  const slots = {
                    default: (scope: any) => {
                  
                      const cellValue = scope.row[scope.column.property];
                      const getRowColumnValue = () => {
                        return scope.column.formatter
                          ? scope.column.formatter(scope.row, scope.column, cellValue, scope.$index)
                          : cellValue;
                      };

                      return sublistState.editIndex === scope.$index
                        ? editComponentBuilder(scope, sublistState)
                        : getRowColumnValue();
                    },
                  };
                  return <ElTableColumn v-slots={slots} {...rawColum} />;
                } else {
                  return <ElTableColumn {...rawColum} />;
                }
              })}
              <ElTableColumn {...this.actionColumnProps} v-slots={this.actionColumnProps.vSlots} />
            </ElTable>
          </ElForm>
        )}

        {!sublistState.editing && (
          <div class="sublist-add" onClick={() => this.addData()}>
            {props.addTitle}
          </div>
        )}
      </div>
    );
  },
});


const buildActionColumnProps = (state: SubListState<any>, ctx: SetupContext<any>): any => {

  function actionEdit(scope: any): void {
    state.editIndex = scope.$index;
    state.editing = true;
    state.editItem = deepCopy(scope.row);
  }


  function actionRemove(index: number): void {
    state?.data?.splice(index, 1);
    ctx.emit('update:modelValue', state.data);
  }

  function actionConfirm() {
    state.sublistForm.validate((valid: boolean): void | boolean => {
      if (valid) {
        if (typeof state?.editIndex === 'number') {
          state.data.splice(state?.editIndex, 1, deepCopy(toRaw(state.editItem)));
        }
        state.editIndex = undefined;
        state.editItem = undefined;
        state.editing = false;
        ctx.emit('update:modelValue', state.data);
      } else {
        return false;
      }
    });
  }

  //取消
  function actionCancel() {
    if (state.isNew) {
      state.data.splice(state.data.length - 1, 1);
    }
    state.editItem = undefined;
    state.editing = false;
    state.editIndex = undefined;
  }

  function isReadonly(): string {
    return state.editing ? 'readonly' : '';
  }

  return {
    align: 'center',
    label: 'ажиллуулах',
    vSlots: {
      default: (scope: any) => (
        <div class="sublist-actions">
          {state.editing && scope.$index === state.editIndex ? (
            <div>
              <span class="sublist-confirm sublist-btn" onClick={() => actionConfirm()}>
                Батлах
              </span>
              <span class="sublist-split">|</span>
              <span class="sublist-cancel sublist-btn" onClick={() => actionCancel()}>
                Цуцлах
              </span>
            </div>
          ) : (
            <div>
              <span
                class={`${isReadonly()} sublist-edit sublist-btn`}
                onClick={() => {
                  if (!state.editing) {
                    actionEdit(scope);
                  }
                }}
              >
                засварлах
              </span>
              <span class={`${isReadonly()} `}>|</span>
              <span
                class={`${isReadonly()} sublist-delete sublist-btn`}
                onClick={() => {
                  if (!state.editing) {
                    actionRemove(scope.$index);
                  }
                }}
              >
                устгах
              </span>
            </div>
          )}
        </div>
      ),
    },
  };
};


function getDefaultEditComponent(): (scope: any, state: SubListState<any>) => JSX.Element {
  return function (scope, state) {
    return (
      <ElFormItem
        size="mini"
        class="sublist-form-item"
        label={scope.column.name}
        prop={scope.column.property}
      >
        <ElInput
          label={scope.column.label}
          size="mini"
          v-model={state.editItem[scope.column.property]}
        />
      </ElFormItem>
    );
  };
}
