import { RouteProperties } from '../route-properties';
import { Exit } from '../exit';
import { Form } from '../form';
import { FormInput } from '../form-input';

export class RouteTemplateBuilder {
    private route: string;
    private description: string;
    private exits: Exit[];
    private forms: Form[];
    private strTemplateContent = '';

    constructor(routeProps: RouteProperties) {
        this.route = routeProps.route;
        this.description = routeProps.description;
        this.exits = routeProps.exits;
        this.forms = routeProps.forms;
        this.setContent();
    }

    private setContent() {
        let str = `<section>
    <h1>Current url: ${this.route}</h1>
    <p>
        ${this.description}
    </p>
    
    <div>
        <div>`; if ( this.forms.length ) { str += `
            <h3>Forms</h3>`; this.forms.forEach((form: Form, idx: number) => {str += `
            <form [formGroup]="form${idx}" (ngSubmit)="${form.action.name}()" style="margin-bottom: 1em;">
                <div class="pageForm">`; this.getInputMocks(idx).forEach((inputHTML: string) => {str += `
                    <div>
                        ${inputHTML}
                    </div>`;}); str += `
                    <button type="submit">${form.action.button.label}</button>
                </div>
            </form>`;}); } if ( this.exits.length ) { str += `
        
            <h3>Exits</h3>
            <ul>`; this.exits.forEach((exit: Exit) => {str += `
                <li>
                    <a [routerLink]="'${exit.route}'">${exit.visibleText}</a>
                </li>`;}); str += `
            </ul>`; } str += `
        </div>
    </div>
    
</section>
`;

        this.strTemplateContent = str;
    }



  private getInputMocks(formIndex: number) {
    const form = this.forms[formIndex];
    const inputMocks = [] as string[];
    form.inputs.forEach((input: FormInput, idx: number) => {
      let tag = '';
      let closeTag = '';
      let innerHTML = '';
      let formControlName = ( input.label ) ? input.label.replace(/[^a-zA-Z0-9]/g, '') : `form${formIndex}Field${idx}`;
      switch ( input.type ) {
        case 'select' :
          tag = '<label>' + input.label + ': <select formControlName="' + formControlName + '"';
          if ( input.attributes.length > 0 ) {
            tag += ' ' + input.attributes;
          }
          tag += '>';
          innerHTML = ( input.value ) ? input.value.split(',').map((value: string) => {
            return '<option value="' + value + '">' + value + '</option>';
          }).join('') : '';
          closeTag = '</select></label>';
          break;

        case 'radio' :
        case 'checkbox' :
          tag = '<dl><dt>' + input.label + ':</dt>';
          innerHTML = ( input.value ) ? input.value.split(',').map((label: string, vIdx: number) => {
            const name = `form${formIndex}_${idx}`;
            const id = `${name}_${vIdx}`;
            const value = label.replace(/"/g, '&quot;');
            let str = `<dd><input type="${input.type}" formControlName="${formControlName}" id="${id}" value="${value}"`;
            if ( input.attributes.length > 0 ) {
              str += ` ${input.attributes}`;
            }
            str += `> <label for="${id}">${label}</label></dd>`;
            return str;
          }).join('') : '';
          closeTag = '</dl>';
          break;

        default :
          tag = `<label>${input.label}: <input type="${input.type}" formControlName="${formControlName}"`;
          if ( input.value && input.value.length > 0 ) {
            tag += ' value="' + input.value + '"';
          }
          if ( input.attributes.length > 0 ) {
            tag += ' ' + input.attributes;
          }
          tag += '>';
          closeTag = '</label>';
          break;
      }
      inputMocks.push(tag + innerHTML + closeTag);
    });
    return inputMocks;
  }

    public toString() {
        return this.strTemplateContent;
    }
}
