function classify(string: string) {
    return string.split('-')
    .filter(str => str.length > 0)
    .map(str => str.substring(0, 1).toUpperCase() + str.substring(1))
    .join('');
}

export function dasherize(string: string) {
    return (string.replace(/([a-z])([A-Z])/g, '$1-$2')).toLowerCase();
}

export function makeDasherizedComponentFromRoute(route: string): string {
    let componentName = makeComponentNameFromRoute(route).replace(/Component$/, '');
    return dasherize(componentName);
}

export function makeComponentNameFromRoute(route: string): string {
    const cleanRoute = route.replace(/[\/,:]/g, '-');
    let componentName = classify(cleanRoute) + 'Component';
    if ( 'Component' === componentName ) {
        componentName = 'HomeComponent';
    }
    return componentName;
}

export function getParamsAsObject(qs: string) {

  const re = /([^&=]+)=?([^&]*)/g;
  const decodeRE = /\+/g;

  const decode = (str: string) => decodeURIComponent(str.replace(decodeRE, ' '));

  const params = {} as any;
  for (let e = re.exec(qs); e !== null; e = re.exec(qs)) {
    let k = decode(e[1]);
    const v = decode(e[2]);
    if (k.substring(k.length - 2) === '[]') {
      k = k.substring(0, k.length - 2);
      (params[k] || (params[k] = [])).push(v);
    } else {
      params[k] = v;
    }
  }

  const assign = (obj: any, keyPath: string[], value: any) => {
    const lastKeyIndex = keyPath.length - 1;
    for (let i = 0; i < lastKeyIndex; ++i) {
      const key = keyPath[i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
  };

  for (const prop in params) {
    if ( params.hasOwnProperty(prop) ) {
      const structure = prop.split('[');
      if (structure.length > 1) {
        const levels = [] as string[];
        structure.forEach((item) => {
          const key = item.replace(/[?[\]\\ ]/g, '');
          levels.push(key);
        });
        assign(params, levels, params[prop]);
        delete (params[prop]);
      }
    }
  }
  return params;
}
