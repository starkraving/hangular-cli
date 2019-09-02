import { join, normalize, strings } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';


export function setupOptions(tree: Tree, options: any): Tree {
    const workspace = getWorkspace(tree);
    if (!options.project) {
        options.project = Object.keys(workspace.projects)[0];
    }
    const project = workspace.projects[options.project];

    options.path = join(normalize(project.root), 'src');
    return tree;
}

export function makeDasherizedComponentFromRoute(route: string): string {
    let componentName = makeComponentNameFromRoute(route).replace(/Component$/, '');
    return strings.dasherize(componentName);
}

export function makeComponentNameFromRoute(route: string): string {
    const cleanRoute = route.replace(/[\/,:]/g, '-');
    let componentName = strings.classify(cleanRoute) + 'Component';
    if ( 'Component' === componentName ) {
        componentName = 'HomeComponent';
    }
    return componentName;
}
