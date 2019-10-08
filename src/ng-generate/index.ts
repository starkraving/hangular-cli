import { strings } from '@angular-devkit/core';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
    addModuleImportToRootModule,
    getProjectFromWorkspace,
    getProjectMainFile,
    hasNgModuleImport
} from '@angular/cdk/schematics';
import {
    addDeclarationToModule,
    addRouteDeclarationToModule,
    insertImport
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import * as ts from 'typescript';
import { setupOptions, makeComponentNameFromRoute } from '../common';
import { RouteComponentBuilder } from '../project-map/files/src/app/scaffular/model/builders/route-component-builder';
import { RouteTemplateBuilder } from '../project-map/files/src/app/scaffular/model/builders/route-template-builder';
import { Exit } from '../project-map/files/src/app/scaffular/model/exit';
import { RouteProperties } from '../project-map/files/src/app/scaffular/model/route-properties';

export default function(options: any): Rule {
    return chain([
        updateRoutingModule(options),
        updateAppTemplate(options),
        generateComponents(options)
    ]);
}

function updateRoutingModule(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        setupOptions(tree, options);
        const projectMap = readProjectMap(tree, options);
        const workspace = getWorkspace(tree);
        const project = getProjectFromWorkspace(workspace, options.project);
        const appRouterPath = project.sourceRoot + '/app/app-routing.module.ts';
        const routerContent: Buffer | null = tree.read(appRouterPath);
        const appModulePath = getAppModulePath(tree, getProjectMainFile(project));
        const moduleContent: Buffer | null = tree.read(appModulePath);

        let strRouterContent = '';
        if ( routerContent ) {
            strRouterContent = routerContent.toString();
        }

        let strModuleContent = '';
        if ( moduleContent ) {
            strModuleContent = moduleContent.toString();
        }
        const source = ts.createSourceFile(appRouterPath, strRouterContent, ts.ScriptTarget.Latest, true);
        const moduleSource = ts.createSourceFile(appModulePath, strModuleContent, ts.ScriptTarget.Latest, true);
        let routerChanges = [];
        let moduleChanges = [];
        let hasForms = false;
        for ( let r = 0 ; r < projectMap.routes.length ; r++ ) {
            let routeProps = projectMap.routes[r];
            let route = routeProps.route;
            let componentName = routeProps.componentName || makeComponentNameFromRoute(route);
            let dasherizedComponent = strings.dasherize(componentName.replace(/Component$/, ''));
            let componentPath = `./components/${dasherizedComponent}/${dasherizedComponent}.component`;
            let routeLiteral = `
            {path: '${route}', component: ${componentName}},`;

            if ( !hasNgModuleImport(tree, appModulePath, componentName) ) {
                moduleChanges.push(addDeclarationToModule(moduleSource, appModulePath, componentName, componentPath));
                routerChanges.push(addRouteDeclarationToModule(source, appRouterPath, routeLiteral));
                routerChanges.push(insertImport(source, appRouterPath, componentName, componentPath));
            }

            if ( routeProps.forms.length ) {
                hasForms = true;
            }
        }

        const routerRecorder = tree.beginUpdate(appRouterPath);
        for (const change of routerChanges) {
            if (change instanceof InsertChange) {
                routerRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        tree.commitUpdate(routerRecorder);

        const moduleRecorder = tree.beginUpdate(appModulePath);
        for ( const changes of moduleChanges ) {
            for ( const change of changes ) {
                if ( change instanceof InsertChange ) {
                    moduleRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
        }
        tree.commitUpdate(moduleRecorder);

        if ( hasForms ) {
            addModuleImportToRootModule(tree, 'ReactiveFormsModule', '@angular/forms', project);
        }

        return tree;
    }
}

function updateAppTemplate(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const projectMap = readProjectMap(tree, options);
        const workspace = getWorkspace(tree);
        const project = getProjectFromWorkspace(workspace);
        const appTemplatePath = project.sourceRoot + '/app/app.component.html';
        const templateMap = readTemplateMap(tree, options);
        const appProps: RouteProperties = {
            route: '',
            description: '',
            forms: [],
            exits: projectMap.globalExits.map((exit: Exit) => {
                if ( !exit.routeLocations || exit.routeLocations.join('').length === 0 ) {
                    exit.routeLocations = ['global'];
                }
                return exit;
            })
        };
        const appTemplateBuilder = new RouteTemplateBuilder(appProps, templateMap);
        const strNewContent = appTemplateBuilder.outer();
        if ( strNewContent.length ) {
            tree.overwrite(appTemplatePath, strNewContent);
        }
        return tree;
    }
}

function generateComponents(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        setupOptions(tree, options);
        const projectMap = readProjectMap(tree, options);
        const templateMap = readTemplateMap(tree, options);
        const workspace = getWorkspace(tree);
        const project = getProjectFromWorkspace(workspace, options.project);

        projectMap.routes.forEach((routeProps: any) => {
            routeProps.componentName = routeProps.componentName || makeComponentNameFromRoute(routeProps.route);
            routeProps.dasherizedName = strings.dasherize(routeProps.componentName.replace(/Component$/, ''));
            const componentPath = project.sourceRoot + `/app/components/${routeProps.dasherizedName}/${routeProps.dasherizedName}.component.ts`;
            const componentBuilder = new RouteComponentBuilder(routeProps);
            if ( !tree.exists(componentPath) ) {
                tree.create(componentPath, componentBuilder.toString());
            } else {
                tree.overwrite(componentPath, componentBuilder.toString());
            }
            const templatePath = project.sourceRoot + `/app/components/${routeProps.dasherizedName}/${routeProps.dasherizedName}.component.html`;
            const templateBuilder = new RouteTemplateBuilder(routeProps, templateMap);
            if ( !tree.exists(templatePath) ) {
                tree.create(templatePath, templateBuilder.toString());
            } else {
                tree.overwrite(templatePath, templateBuilder.toString());
            }
        });
        return tree;
    }
}

function readTemplateMap(tree: Tree, options: any) {
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);
    const templateMapFile = project.sourceRoot + '/app/scaffular/prototype/templateProps.json';
    const content:Buffer | null = tree.read(templateMapFile);
    if ( !content ) {
        return {
            type: 'template',
            value: '',
            wrapper: '',
            items: []
        };
    }
    return JSON.parse(content.toString());
}

function readProjectMap(tree: Tree, options: any) {
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);
    const projectMapPath = project.sourceRoot + '/app/scaffular/model/project.json';
    const content:Buffer | null = tree.read(projectMapPath);
    if ( !content ) {
        return {
            routes: [],
            globalExits: []
        };
    }
    return fixProjectMap(JSON.parse(content.toString()));
}

function fixProjectMap(projectMap: any) {
    projectMap.routes = projectMap.routes.map((routeProp: RouteProperties) => {
        if ( routeProp.route.charAt(0) === '/' ) {
            routeProp.route = routeProp.route.substring(1);
        }
        return routeProp;
    });

    return projectMap;
}

