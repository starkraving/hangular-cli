import { makeComponentNameFromRoute, dasherize } from '../../common/helpers';
import { RouteProperties } from '../route-properties';
import { Form } from '../form';
import { FormInput } from '../form-input';

export class RouteComponentBuilder {
    private routeParams: string[] = [];
    private forms: Form[];
    private importInsertAt: number;
    private paramInsertAt: number;
    private methodInsertAt: number;
    private initStartsAt: number;
    private dependencyInsertAt: number;
    private dasherizedName: string;
    private componentName: string;
    private strComponent = `import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-@dasherizedName@',
  templateUrl: './@dasherizedName@.component.html'
})
export class @componentName@ implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}`;

    constructor(routeProps: RouteProperties) {
        (routeProps.route.split('?')[0].split('/')).forEach((fragment: string) => {
            if ( fragment.indexOf(':') === 0 ) {
                this.routeParams.push(fragment.substring(1));
            }
        });
        this.forms = routeProps.forms;
        this.componentName = routeProps.componentName || makeComponentNameFromRoute(routeProps.route);
        this.dasherizedName = routeProps.dasherizedName || dasherize(this.componentName.replace(/Component$/, ''));
        this.strComponent = this.strComponent.replace(/@dasherizedName@/g, this.dasherizedName);
        this.strComponent = this.strComponent.replace('@componentName@', this.componentName);

        this.setInsertAts();
        this.handleForms();
        this.handleRouteParams();
    }

    setInsertAts() {
        const constructorStartAt = this.strComponent.indexOf('constructor(');
        this.importInsertAt = this.strComponent.indexOf('@Component({') - 2;
        this.paramInsertAt = constructorStartAt - 3;
        this.dependencyInsertAt = constructorStartAt + 12;
        this.initStartsAt = this.strComponent.indexOf('ngOnInit() {') + 12;
        this.methodInsertAt = this.strComponent.length - 2;
    }

    handleForms() {
        if ( this.forms.length ) {
            let hasRedirect = false;
            this.forms.forEach((form: Form, idx: number) => {
                const action = form.action.name;
                const formAction = 'setUpForm' + idx;
                let redirect = undefined;
                if ( form.action.exit && form.action.exit.route ) {
                    redirect = form.action.exit.route;
                    hasRedirect = true;
                }
                this.addMethod(action, redirect);
                this.addFormMethod(formAction, form);
            });
            if ( hasRedirect ) {
                this.addDependency('router', 'Router', '@angular/router');
            }
            this.addImport('FormBuilder, FormGroup', '@angular/forms');
            this.addDependency('formBuilder', 'FormBuilder');
        }
    }

    handleRouteParams() {
        if ( this.routeParams.length ) {
            this.addDependency('activatedRoute', 'ActivatedRoute', '@angular/router');
            this.routeParams.forEach((param: string) => {
                this.addParam(param);
            });
        }
    }

    addFormMethod(formAction: string, form: Form) {
        const formProp = formAction.replace('setUpForm', 'form');
        const formMember = `  ${formProp}: FormGroup;\n`;
        const formInit = `
    this.${formAction}();`;
        let content = `
    this.${formProp} = this.formBuilder.group({`;
        form.inputs.forEach((input: FormInput, idx: number) => {
            const propName = ( input.label ) ? input.label.replace(/[^a-zA-Z0-9]/g, '') : `${formProp}Field${idx}`;
            content += `\n      ${propName}: '',`;
        });
        content += `
    });`;

        this.addMethod('private ' + formAction, undefined, content);
        this.strComponent =
            this.strComponent.substring(0, this.initStartsAt)
            + formInit
            + this.strComponent.substring(this.initStartsAt);
        this.strComponent =
            this.strComponent.substring(0, this.paramInsertAt)
            + formMember
            + this.strComponent.substring(this.paramInsertAt);
        this.setInsertAts();
    }

    addImport(className: string, from: string) {
        const newImport = `
import { ${className} } from '${from}';`;
        this.strComponent =
            this.strComponent.substring(0, this.importInsertAt)
            + newImport
            + this.strComponent.substring(this.importInsertAt);
        this.setInsertAts();
    }

    addDependency(member: string, className: string, from: string | null = null) {
        const newDependency = `
    private ${member}: ${className},`;
        this.strComponent =
            this.strComponent.substring(0, this.dependencyInsertAt)
            + newDependency
            + this.strComponent.substring(this.dependencyInsertAt);
        if ( from ) {
            this.addImport(className, from);
        }
    }

    addParam(param: string) {
        const newParamContent = `  private ${param}: string;\n`;
        const newParamInit = `
    this.${param} = this.activatedRoute.snapshot.paramMap.get('${param}');`;
        this.strComponent =
            this.strComponent.substring(0, this.initStartsAt)
            + newParamInit
            + this.strComponent.substring(this.initStartsAt);
        this.strComponent =
            this.strComponent.substring(0, this.paramInsertAt)
            + newParamContent
            + this.strComponent.substring(this.paramInsertAt);
        this.setInsertAts();
    }

    addMethod(action: string, redirect: string | undefined, content: string | null = null) {
        const strRedirect = ( !redirect ) ? '' : `
    this.router.navigate(['${redirect}']);`;
        content = content || `
    // TODO: do the thing`
        const strMethod = `
  ${action}() {${content}${strRedirect}
  }
`;
        this.strComponent =
            this.strComponent.substring(0, this.methodInsertAt)
            + strMethod
            + this.strComponent.substring(this.methodInsertAt);
        this.setInsertAts();
    }

    toString() {
        return this.strComponent;
    }
}
