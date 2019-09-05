import { strings } from '@angular-devkit/core';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
    addModuleImportToRootModule,
    getProjectFromWorkspace,
    getProjectMainFile,
    hasNgModuleImport
} from '@angular/cdk/schematics';
import { addRouteDeclarationToModule, insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import * as ts from 'typescript';
import { setupOptions, makeComponentNameFromRoute } from '../common';
import { RouteComponentBuilder } from '../project-map/files/src/app/scaffular/model/builders/route-component-builder';

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
        const content: Buffer | null = tree.read(appRouterPath);
        const appModulePath = getAppModulePath(tree, getProjectMainFile(project));

        let strContent = '';
        if ( content ) {
            strContent = content.toString();
        }
        const source = ts.createSourceFile(appRouterPath, strContent, ts.ScriptTarget.Latest, true);
        let changes = [];
        for ( let r = 0 ; r < projectMap.routes.length ; r++ ) {
            let routeProps = projectMap.routes[r];
            let route = routeProps.route;
            let componentName = routeProps.componentName || makeComponentNameFromRoute(route);
            let dasherizedComponent = strings.dasherize(componentName.replace(/Component$/, ''));
            let componentPath = `./components/${dasherizedComponent}/${dasherizedComponent}.component`;
            let routeLiteral = `
            {path: '${route}', component: ${componentName}},`;

            if ( !hasNgModuleImport(tree, appModulePath, componentName) ) {
                addModuleImportToRootModule(tree, componentName, componentPath, project);
                changes.push(addRouteDeclarationToModule(source, appRouterPath, routeLiteral));
                changes.push(insertImport(source, appRouterPath, componentName, componentPath));
            }
        }

        const exportRecorder = tree.beginUpdate(appRouterPath);
        for (const change of changes) {
            if (change instanceof InsertChange) {
                exportRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        tree.commitUpdate(exportRecorder);
        return tree;
    }
}

function updateAppTemplate(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const projectMap = readProjectMap(tree, options);
        if ( projectMap.globalExits.length ) {
            const workspace = getWorkspace(tree);
            const project = getProjectFromWorkspace(workspace);
            const appTemplatePath = project.sourceRoot + '/app/app.component.html';
            const content: Buffer | null = tree.read(appTemplatePath);
            let strContent = '';
            if ( content ) {
                strContent = content.toString();
            }
            let strNewContent = '';
            for ( let r = 0 ; r < projectMap.globalExits.length ; r++ ) {
                let strRouterLink = `routerLink="${projectMap.globalExits[r].route}"`;
                let strLinkText = projectMap.globalExits[r].visibleText;
                if ( strContent.indexOf(strRouterLink) === -1 ) {
                    strNewContent += `
                    <li><a ${strRouterLink}>${strLinkText}</a></li>`;
                }
            }
            if ( strNewContent.length ) {
                const strNewContentWrapper = '<h3>Global Exits</h3><ul>';
                let pos = strContent.indexOf(strNewContentWrapper);
                if ( pos === -1 ) {
                    strContent = strContent.replace(
                        '<router-outlet></router-outlet>',
                        '<router-outlet></router-outlet>' + strNewContentWrapper);
                    pos = strContent.indexOf(strNewContentWrapper);
                }
                pos = pos + strNewContentWrapper.length;
                strContent = strContent.substring(0, pos) + strNewContent + strContent.substring(pos);
                tree.overwrite(appTemplatePath, strContent);
            }
        }
        return tree;
    }
}

function generateComponents(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        setupOptions(tree, options);
        const projectMap = readProjectMap(tree, options);
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
        });
        return tree;
    }
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
    return JSON.parse(content.toString());
}

