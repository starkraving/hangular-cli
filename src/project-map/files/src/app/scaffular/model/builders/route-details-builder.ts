import { RouteTemplateBuilder } from './route-template-builder';

export class RouteDetailsBuilder extends RouteTemplateBuilder {

  protected setContent() {
    this.foundProps.routeDetails = `<h1>Current URL: {{ currentURL }}</h1>
      <p>
        {{ description }}
      </p>
      <div *ngIf="visibleForm !== undefined">
        <h3>{{ visibleForm.action.name }}</h3>
        <p>{{ visibleForm.action.description }}</p>

        <button type="button" *ngIf="visibleForm.action.exit && visibleForm.action.exit.route.length"
                (click)="router.navigate([visibleForm.action.exit.route], {queryParams: getRouteParams(visibleForm.action.exit.route)})">
          Navigate to {{ visibleForm.action.exit.route }}
        </button>
        <button *ngIf="!visibleForm.action.exit || !visibleForm.action.exit.route.length"
                (click)="_showForm(undefined)">Finished
        </button>
      </div>`;

    for ( const key in this.templateProps ) {
      if ( !this.templateProps.hasOwnProperty(key) ) {
        continue;
      }
      if ( key.indexOf('forms-') === 0 ) {
        this.updateFormProps(key);
      } else if ( key.indexOf('links-') === 0 ) {
        this.updateLinkProps(key);
      }
    }
    this.strTemplateContent = this.removePlaceHolders();
  }

  private updateFormProps(key: string) {
    const formKey = key.replace('forms-', '');
    const inputMockStartMatch = this.templateProps[key]['repeat-form']['repeat-inputMocks'].wrapper.match(/^(<[^>]*)>/);
    const inputMockCloseMatch = this.templateProps[key]['repeat-form']['repeat-inputMocks'].wrapper.match(/(<\/[^.]*>)$/);
    let inputMockStartTag = '<div';
    let inputMockCloseTag = '</div>';
    if (inputMockStartMatch && inputMockStartMatch[1]) {
      inputMockStartTag = inputMockStartMatch[1];
    }
    if ( inputMockCloseMatch && inputMockCloseMatch[1] ) {
      inputMockCloseTag = inputMockCloseMatch[1];
    }
    this.foundProps[key] = {
      'repeat-form': {
        attributes: `*ngFor="let form of forms['${formKey}']"`,
        'repeat-inputMocks': `${inputMockStartTag} [innerHTML]="templateBuilder.inputMocksToString(form, '${formKey}') | safeHtml">`
          + inputMockCloseTag,
        btn_attributes: 'type="button" (click)="_showForm(form)"',
        visibleText: '{{ form.action.button.label }}'
      }
    };
    this.templateProps[key].wrapper = this.templateProps[key].wrapper.replace(
      /^([^>]*)>/,
      '$1 ' + `*ngIf="forms['${formKey}'] && forms['${formKey}'].length">`
    );
  }

  private updateLinkProps(key: string) {
    const linkKey = key.replace('links-', '');
    this.foundProps[key] = {
      'repeat-link': {
        attributes: `[routerLink]="getRouteLink(exit.route)" [queryParams]="getRouteParams(exit.route)"`,
        visibleText: `{{ exit.visibleText }}`
      }
    };
    this.templateProps[key]['repeat-link'].wrapper
      = this.templateProps[key]['repeat-link'].wrapper.replace(
      /^([^>]*)>/,
      '$1 ' + `*ngFor="let exit of links['${linkKey}']">`
    );
    this.templateProps[key].wrapper = this.templateProps[key].wrapper.replace(
      /^([^>]*)>/,
      '$1 ' + `*ngIf="links['${linkKey}'] && links['${linkKey}'].length">`
    );
  }

  public toString(): string {
    return this.strTemplateContent
        .replace('<!-- inner content start -->', '')
        .replace('<!-- inner content end -->', '');
  }

}
