import {
    apply,
    chain, FileEntry,
    forEach,
    mergeWith,
    Rule,
    SchematicContext,
    template,
    Tree,
    url
} from '@angular-devkit/schematics';
import { getProjectFromWorkspace } from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { setupOptions } from '../common';
import { RouteDetailsBuilder } from '../project-map/files/src/app/scaffular/model/builders/route-details-builder';
import { TemplateReader } from './templateReader';

export default function(options: any): Rule {
    return chain([
        readPropFile(options),
        saveFilesForAngular(options),
    ]);
}

function readPropFile(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        setupOptions(tree, options);
        const workspace = getWorkspace(tree);
        const project = getProjectFromWorkspace(workspace, options.project);
        const templatePath = project.sourceRoot + '/app/scaffular/prototype/';
        options.templateReader = new TemplateReader(templatePath);
    }
}

function saveFilesForAngular(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const jsonProps = JSON.stringify(
            options.templateReader.getProps(),
            null,
            '\t');
        const templateProps = options.templateReader.getProps();
        const routeProps = RouteDetailsBuilder.defaultProps;
        const routeDetailsBuilder = new RouteDetailsBuilder(routeProps, templateProps);
        const files = apply(
            url('./files'), [
                template({
                    ...options,
                    ...{
                        props: jsonProps,
                        routeDetails: routeDetailsBuilder.toString()
                    }
                }),
                forEach((fileEntry: FileEntry) => {
                    if (tree.exists(fileEntry.path)) {
                        tree.overwrite(fileEntry.path, fileEntry.content);
                    }
                    return fileEntry;
                }),
            ]
        );

        return mergeWith(files);
    }
}
