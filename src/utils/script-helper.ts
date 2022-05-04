const ScriptHelper = {
  execute(scriptStr: string, options: unknown): unknown {
    return Function('"use strict";return (' + scriptStr + ')')()(options);
  },
  executeEl(callObject: unknown, logicStr: string): unknown {
    return Function('"use strict";return (function(){ return ' + logicStr + '})')().call(
      callObject,
    );
  },
};


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const set = (obj: any, path: string, value: unknown): void => {
  let schema = obj;
  const pList = path.split('.');
  const len = pList.length;
  for (let i = 0; i < len - 1; i++) {
    const elem = String(pList[i]);
    schema = schema[elem] || {};
  }

  schema[pList[len - 1]] = value;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const resolve = (path: string, obj: any): unknown => {
  return path.split('.').reduce(function (prev, curr) {
    return prev ? prev[curr] : null;
  }, obj || self);
};

export default ScriptHelper;
