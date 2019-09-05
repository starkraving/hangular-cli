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
