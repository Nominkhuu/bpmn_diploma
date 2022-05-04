import { defineComponent, ref, nextTick } from 'vue';
import ButtonRender, { ButtonRenderProps } from '../../components/button-render';
import { BpmnStore } from '@/bpmn/store';
import CodeMirror from 'codemirror';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/addon/hint/xml-hint.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

import './bpmn-actions.css';
import { ModdleElement } from '@/bpmn/type';

export default defineComponent({
  name: 'BpmnActions',
  setup() {

    const zoom = ref(1);
    const previewActive = ref(false);
    const xml = ref('');

    return {
      zoom,
      previewActive,
      xml,
    };
  },
  render() {
    const bpmnContext = BpmnStore;
    let coder: CodeMirror.EditorFromTextArea;

    const importFile = function (event: Event) {
      const eventTarget = event.target as HTMLInputElement;
      if (eventTarget.files) {
        const file = eventTarget.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
          if (this.result) {
            bpmnContext.importXML(this.result as string);
          }
        };
      }
    };
    const buttonRenderProps: ButtonRenderProps = {
      buttons: [
        {
          label: 'импорт',
          icon: 'icon-shangchuan',
          action: () => {
            document.getElementById('bpmn-upload-element')?.click();
          },
        },
        {
          label: 'SVG экспортлох',
          icon: 'icon-zu920',
          action: () => {
            const rootElement: ModdleElement = bpmnContext
              .getModeler()
              .get('canvas')
              .getRootElement();
            bpmnContext
              .getSVG()
              .then((response) => {
                download(response.svg, rootElement.id || 'process', 'svg');
              })
              .catch((err: unknown) => {
                console.warn(err);
              });
          },
        },
        {
          label: 'XML экспортлох',
          icon: 'icon-zu1359',
          action: () => {
            const rootElement: ModdleElement = bpmnContext
              .getModeler()
              .get('canvas')
              .getRootElement();
            bpmnContext
              .getXML()
              .then((response: { xml: string }) => {
                download(response.xml, rootElement.id || 'process', 'bpmn');
              })
              .catch((err: unknown) => {
                console.warn(err);
              });
          },
        },
        {
          label: 'томруулах',
          icon: 'icon-fangda',
          action: () => {
            this.zoom = Math.floor(this.zoom * 100 + 0.1 * 100) / 100;
            bpmnContext.getModeler().get('canvas').zoom(this.zoom);
          },
        },
        {
          label: 'жижигрүүлэх',
          icon: 'icon-suoxiao',
          action: () => {
            this.zoom = Math.floor(this.zoom * 100 - 0.1 * 100) / 100;
            bpmnContext.getModeler().get('canvas').zoom(this.zoom);
          },
        },
        {
          label: 'сэргээх',
          icon: 'icon-quxiaoquanping',
          action: () => {
            this.zoom = 1;
            bpmnContext.getModeler().get('canvas').zoom('fit-viewport', 'auto');
          },
        },
        {
          label: 'үзэх',
          icon: 'icon-xianshi',
          action: () => {
            console.warn();
            bpmnContext
              .getXML()
              .then((response) => {
                this.xml = response.xml;
                this.previewActive = true;

                nextTick(() => {
                  if (!coder) {
                    coder = CodeMirror.fromTextArea(
                      document.getElementById('xml-highlight-container') as HTMLTextAreaElement,
                      {
                        lineWrapping: true,
                        mode: 'application/xml', 
                        theme: 'material',
                        lineNumbers: true,
                        lint: true,
                      },
                    );
                    coder.setSize('100%', '100%');
                  } else {
                    coder.setValue(this.xml);
                  }
                });
              })
              .catch((err: unknown) => {
                console.warn(err);
              });
          },
        },
      ],
    };
    return (
      <div class="bpmn-actions">
        <ButtonRender {...buttonRenderProps} />
        <el-drawer size="35%" direction="ltr" withHeader={false} v-model={this.previewActive}>
          <textarea id="xml-highlight-container" v-model={this.xml} />
        </el-drawer>
        <input
          type="file"
          id="bpmn-upload-element"
          ref="refFile"
          style="display: none"
          accept=".xml, .bpmn"
          onChange={importFile}
        />
      </div>
    );
  },
});


const download = (data: string, filename: string, type: string): void => {
  const blob = new Blob([data]);
  const tempLink = document.createElement('a'); 
  const href = window.URL.createObjectURL(blob);

  const fileName = `${filename}.${type}`;
  tempLink.href = href;
  tempLink.target = '_blank';
  tempLink.download = fileName;
  document.body.appendChild(tempLink);
  tempLink.click(); 
  document.body.removeChild(tempLink); 
  window.URL.revokeObjectURL(href); 
};
