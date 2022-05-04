import { defineComponent, PropType, reactive, toRaw, watchEffect, watch } from 'vue';
import ScriptHelper, { resolve } from '../../utils/script-helper';
import { FieldDefine } from './index';


export default defineComponent({
  name: 'DynamicBinder',
  props: {

    modelValue: {
      type: Object as PropType<unknown>,
      default: () => Object.assign({}),
      required: true,
    },

    fieldDefine: {
      type: Object as PropType<FieldDefine>,
      default: () => ({}),
      required: true,
    },

    bindTransformer: {
      type: Function,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'fieldChange'],
  setup(props, context) {
    const state = reactive({
      flatFieldDefine: flatObject(props.fieldDefine || {}, {}),
      handingModel: Object.assign({}),
    });
    watchEffect(() => {
      state.handingModel = props.modelValue;
      state.flatFieldDefine = flatObject(props.fieldDefine, {});
    });

    
    const bindTransformer = props.bindTransformer || defaultTransformer;
    const dataBindTransformer = function (key: string, value: unknown) {
      return bindTransformer(state.handingModel, key, value);
    };

    return () => (
      <div class="dynamic-binder">
        {Object.keys(state.flatFieldDefine).map((key) => {
          const define = state.flatFieldDefine[key];

          if (define && predicate(define, toRaw(props.modelValue))) {
            const bindData = dataBindTransformer(key, define);
            const Component = toRaw(define.component);

            watch(
              () => bindData.value,
              () => {
                // state.handingModel[bindData.bindKey] = bindData.value;
                context.emit('update:modelValue', state.handingModel);

                if (bindData.setValue) {
                  const setValueCallBack = bindData.setValue(
                    toRaw(props.modelValue),
                    bindData.bindKey,
                    bindData.value,
                  );
                  if (setValueCallBack) {
                    setValueCallBack();
                  }
                } else {
                  context.emit('fieldChange', bindData.bindKey, bindData.value);
                }
              },
            );

            return (
              <Component
                {...bindData}
                v-model={bindData.value}
                v-slots={bindData.vSlots}
                class={`${Component.name}-${key} dynamic-binder-item`}
              />
            );
          }
          return null;
        })}
      </div>
    );
  },
});

function flatObject(source: FieldDefine, target: FieldDefine, prefix = ''): FieldDefine {
  Object.keys(source).forEach((key) => {
    const currentKeyObj = source[key];
    if (!currentKeyObj || !(typeof currentKeyObj === 'object')) {
      return;
    }
    const component = currentKeyObj.component;
    if (component) {
      target[prefix + key] = currentKeyObj;
    } else {
      flatObject(currentKeyObj, target, `${key}.`);
    }
  });
  return target;
}

function predicate(fieldDefine: FieldDefine, modelValue: unknown): boolean {
  const bindDefinePredicate = fieldDefine.predicate;
  if (bindDefinePredicate) {
    if (typeof bindDefinePredicate === 'string') {
      return ScriptHelper.executeEl(modelValue, bindDefinePredicate) as boolean;
    }

    if (typeof bindDefinePredicate === 'function') {
      return bindDefinePredicate(modelValue);
    }
  }
  return true;
}

function defaultTransformer(
  sourceModel: unknown,
  bindKey: string,
  bindDefine: FieldDefine,
): unknown {
  return reactive({
    bindKey,
    ...bindDefine,
    sourceModel,
    value: bindDefine.getValue
      ? bindDefine.getValue(toRaw(sourceModel))
      : resolve(bindKey, sourceModel) || '',
  });
}
