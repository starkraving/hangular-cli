import { Exit } from '../exit';
import { Form } from '../form';
import { FormInput } from '../form-input';
import { RouteProperties } from '../route-properties';

export class RouteTemplateBuilder {

  public static defaultProps: RouteProperties = {
    route: '',
    description: '',
    exits: [],
    forms: []
  };

  protected route: string;
  protected description: string;
  protected exits: Exit[];
  protected forms: Form[];
  protected templateProps: any;
  protected foundProps: any = {
    routeDetails: ''
  };
  protected strTemplateContent = '';

  protected static fixEmptyLinkLocation(exit: Exit): Exit {
    if (exit.routeLocations.join('').length === 0) {
      exit.routeLocations = ['general'];
    }
    return exit;
  }

  protected static fixEmptyFormLocation(form: Form): Form {
    if (form.action.exit && form.action.exit.routeLocations.join('').length === 0) {
      form.action.exit.routeLocations = ['general'];
    }
    return form;
  }

  protected static reduce(prop: any) {
    if ( prop.wrapper && !prop.items ) {
      return prop;
    }
    prop.items.forEach((subProp: any) => {
      const key = subProp.type + ((subProp.value.length) ? '-' + subProp.value : '');
      prop[key] = RouteTemplateBuilder.reduce(subProp);
    });
    delete prop.type;
    delete prop.value;
    delete prop.items;
    return prop;
  }

  protected static makeInputValues(input: FormInput, attributes: string = ''): any {
    return ( input && input.value ) ? input.value.split(',').map((value: string) => {
      return {
        attributes: `value="${value}"${attributes}`,
        value: `${value}`
      };
    }) : [];
  }

  protected static makeFormLocations(form: Form): string[] {
    const locations = (form.action.exit)
      ? form.action.exit.routeLocations.map((loc: string) => {
        return 'forms-' + ((loc) ? loc : 'general');
      })
      : ['forms-general'];
    return locations.filter(RouteTemplateBuilder.arrayUnique);
  }

  protected static makeLinkLocations(exit: Exit): string[] {
    const locations = exit.routeLocations.map((loc: string) => {
      return 'links-' + ((loc) ? loc : 'general');
    });
    return locations.filter(RouteTemplateBuilder.arrayUnique);
  }

  protected static arrayUnique(value: string, idx2: number, self: any): boolean {
    return self.indexOf(value) === idx2;
  }

  constructor(routeProps: RouteProperties, templateProps: any) {
    this.templateProps = RouteTemplateBuilder.reduce(templateProps);
    this.route = routeProps.route;
    this.description = routeProps.description;
    this.exits = routeProps.exits.map(RouteTemplateBuilder.fixEmptyLinkLocation);
    this.forms = routeProps.forms.map(RouteTemplateBuilder.fixEmptyFormLocation);
    this.setContent();
  }

  protected setContent() {
    this.getFoundLinks();
    this.getFoundForms();
    this.setUnfound();
    this.foundProps.routeDetails = `<h1>Current url: ${this.route}</h1>
    <p>
        ${this.description}
    </p>
    `;

    this.strTemplateContent = this.removePlaceHolders();
  }

  protected getFoundLinks() {
    this.exits.forEach((exit: Exit) => {
      RouteTemplateBuilder.makeLinkLocations(exit).forEach((loc: string) => {
        this.prepLocation(loc, 'repeat-link');
        this.foundProps[loc]['repeat-link'].push({
          attributes: `[routerLink]="${exit.route}"`,
          visibleText: exit.visibleText
        });
      });
    });
  }

  protected getFoundForms() {
    this.forms.forEach((form: Form, idx: number) => {
      RouteTemplateBuilder.makeFormLocations(form).forEach((loc: string) => {
        this.prepLocation(loc, 'repeat-form');
        this.foundProps[loc]['repeat-form'].push({
          attributes: `[formGroup]="form${idx}" (ngSubmit)="${form.action.name}()"`,
          'repeat-inputMocks': this.inputMocks(form, idx),
          btn_attributes: 'type="submit"',
          visibleText: form.action.button.label
        });
      });
    });
  }

  protected prepLocation(loc: string, type: string) {
    if (!this.foundProps.hasOwnProperty(loc)) {
      this.foundProps[loc] = {};
      this.foundProps[loc][type] = [];
    }
  }

  protected inputMocks(form: Form, formIndex: number) {
    const inputs: any = {
      'repeat-input': [],
      'repeat-select': [],
      'repeat-option': []
    };
    let key = 'repeat-input';
    form.inputs.forEach((input: FormInput, idx: number) => {
      const formControlName = (input.label) ? input.label.replace(/[^a-zA-Z0-9]/g, '') : `form${formIndex}Field${idx}`;
      const inputProps: any = {label: input.label};
      inputProps.attributes = `formControlName="${formControlName}"`;
      if (input.attributes.length) {
        inputProps.attributes += ` ${input.attributes}`;
      }

      switch (input.type) {
        case 'select' :
          key = 'repeat-select';
          inputProps['repeat-value'] = RouteTemplateBuilder.makeInputValues(input);
          break;

        case 'radio' :
        case 'checkbox' :
          key = 'repeat-option';
          inputProps.attributes += ` type="${input.type}"`;
          inputProps['repeat-value'] = RouteTemplateBuilder.makeInputValues(input, ' ' + inputProps.attributes);
          delete inputProps.attributes;
          break;

        default :
          inputProps.attributes += ` type="${input.type}"`;
      }
      inputs[key].push(inputProps);
    });

    return inputs;
  }

  protected setUnfound() {
    Object.keys(this.templateProps)
      .filter((key: string) => 'wrapper' !== key)
      .forEach((key: string) => {
        if ( !this.foundProps.hasOwnProperty(key) ) {
          this.foundProps[key] = '';
        }
      });
  }

  protected removePlaceHolders(props: any = this.templateProps, foundProps: any = this.foundProps): string {
    let wrapper = props.wrapper || '';
    let iterations = 0;
    while ( iterations < 5 && Object.keys(foundProps).length > 0 ) {
      for ( const key in foundProps ) {
        if ( foundProps.hasOwnProperty(key) && wrapper.indexOf(`{{ ${key} }}`) > -1 ) {
          if ( Array.isArray(foundProps[key]) ) {
            foundProps[key] = foundProps[key].map((prop: any) => this.removePlaceHolders(props[key], prop)).join('');
          } else if ( typeof foundProps[key] === 'object' ) {
            foundProps[key] = this.removePlaceHolders(props[key], foundProps[key]);
          }
          const regex = new RegExp(`{{ ${key} }}`, 'g');
          wrapper = wrapper.replace(regex, foundProps[key]);
          delete foundProps[key];
        }
      }
      iterations++;
    }
    return wrapper;
  }

  public inputMocksToString(form: Form, location: string): string {
    location = 'forms-' + location;
    const inputMockProps = this.templateProps[location]['repeat-form']['repeat-inputMocks'];
    return this.removePlaceHolders(
      {
        wrapper: '{{ repeat-input }}{{ repeat-select }}{{ repeat-option }}',
        'repeat-input': inputMockProps['repeat-input'],
        'repeat-select': inputMockProps['repeat-select'],
        'repeat-option': inputMockProps['repeat-option']
      },
      this.inputMocks(form, 0)
    );
  }

  public toString() {
    return this.strTemplateContent.substring(
      this.strTemplateContent.indexOf('<!-- inner content start -->') + 28,
      this.strTemplateContent.indexOf('<!-- inner content end -->')
    );
  }

  public outer() {
    return this.strTemplateContent.substr(0, this.strTemplateContent.indexOf('<!-- inner content start -->'))
      + '<router-outlet></router-outlet>'
      + this.strTemplateContent.substr(this.strTemplateContent.indexOf('<!-- inner content end -->') + 26);
  }
}
