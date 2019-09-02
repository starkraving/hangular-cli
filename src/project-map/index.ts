import { join, normalize } from '@angular-devkit/core';
import {
  apply, chain, FileEntry, forEach,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree, url
} from '@angular-devkit/schematics';
import {
  addModuleImportToRootModule,
  getProjectFromWorkspace,
  getProjectMainFile,
  hasNgModuleImport
} from '@angular/cdk/schematics';
import { getWorkspace } from '@schematics/angular/utility/config';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function projectMap(options: any): Rule {
  return chain([
    copyModuleFiles(options),
    addModuleImport(options),
    removeComponentPlaceholder(options)
  ]);
}

function copyModuleFiles(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    setupOptions(tree, options);

    const movePath = normalize(options.path + '/');
    const templateSource = apply(url('./files/src'), [
      template({...options}),
      move(movePath),
      forEach((fileEntry: FileEntry) => {
        if (tree.exists(fileEntry.path)) {
          tree.overwrite(fileEntry.path, fileEntry.content);
        }
        return fileEntry;
      }),
    ]);
    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, _context);
  };
}

function addModuleImport(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const IMPORT_IDENTIFIER = 'ScaffularModule';
    const IMPORT_PATH = './scaffular/scaffular.module';
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);
    const appModulePath = getAppModulePath(tree, getProjectMainFile(project));

    if ( !hasNgModuleImport(tree, appModulePath, IMPORT_IDENTIFIER) ) {
      addModuleImportToRootModule(tree, IMPORT_IDENTIFIER, IMPORT_PATH, project);
    }

    return tree;
  }
}

function removeComponentPlaceholder(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);
    const appTemplatePath = project.sourceRoot + '/app/app.component.html';
    const content: Buffer | null = tree.read(appTemplatePath);
    let strContent = '';
    if ( content ) {
      strContent = content.toString();
    }
    if ( strContent.indexOf('<!--The content below is only a placeholder and can be replaced.-->') > -1 ) {
      strContent = '<router-outlet></router-outlet>';
      tree.overwrite(appTemplatePath, strContent);
    }

    return tree;
  }
}

function setupOptions(tree: Tree, options: any): Tree {
  const workspace = getWorkspace(tree);
  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  const project = workspace.projects[options.project];

  options.path = join(normalize(project.root), 'src');
  return tree;
}
