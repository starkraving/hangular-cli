import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Form } from '../../model/form';
import { FormInput } from '../../model/form-input';
import { RouteProperties } from '../../model/route-properties';
import { RoutePropertiesFromForm } from '../../model/builders/route-properties-from-form';
import templateProps from '../../prototype/templateProps.json';
import { ProjectMapService } from '../../service/project-map.service';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Exit } from '../../model/exit';

@Component({
  selector: 'app-theme-handler',
  templateUrl: './theme-handler.component.html',
  styleUrls: ['./theme-handler.component.scss']
})
export class ThemeHandlerComponent implements OnInit {
  currentURL: string;
  editing: boolean = false;
  routeFound: boolean = true;
  globalExits: Exit[];
  routeProperties: RouteProperties;
  routePropsForm: FormGroup;
  formPropsForm: FormGroup;
  visibleForm: Form;
  formLocations: string[] = [];
  exitLocations: string[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private projectMap: ProjectMapService,
    private formBuilder: FormBuilder
    ) {
    this.router.events.subscribe(event => {
      if ( event instanceof NavigationEnd) {
        this.currentURL = (this.projectMap.normalizeRoute(event.urlAfterRedirects)).split('?')[0];
        this.setUp();
      }
    });

    templateProps.items.forEach((item: any) => {
      if ( item.type === 'forms' ) {
        this.formLocations.push(item.value);
      } else {
        this.exitLocations.push(item.value);
      }
    });
  }

  ngOnInit() {}

  private setUp() {
    this.visibleForm = undefined;
    this.globalExits = this.projectMap.getGlobalExits();
    const routeProperties = this.projectMap.getRoute(this.currentURL);
    this.routeProperties = routeProperties as RouteProperties;
    this.routeFound = ( undefined !== this.routeProperties );
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.editing = ( 'edit' === params.get('mode') || !this.routeFound );
    });
    this.loadRoutePropsForm();
  }

  toggleEditing() {
    this.editing = !this.editing;
    const self = this;
    setTimeout(() => {
      if ( !self.editing ) {
        self.visibleForm = undefined;
      }
    }, 0);
  }

  showForm(form: any) {
    this.visibleForm = form;
    if ( form !== undefined ) {
      this.loadFormPropsForm(form);
    } else {
      this.formPropsForm = undefined;
    }
  }

  private loadRoutePropsForm() {
    this.routePropsForm = this.formBuilder.group({
      route: this.routeFound ? this.routeProperties.route : this.currentURL,
      description: this.routeFound ? this.routeProperties.description : '',
      forms: this.formBuilder.array(this.makeEmptyFormProps(this.routeFound ? this.routeProperties.forms : [] as Form[])),
      exits: this.formBuilder.array(this.makeEmptyExitProps(this.routeFound ? this.routeProperties.exits : [] as Exit[]))
    });
  }

  private loadFormPropsForm(formProps: Form) {
    this.formPropsForm = this.formBuilder.group({
      action: this.formBuilder.group({
        name: formProps.action.name,
        description: formProps.action.description,
        button: formProps.action.button.label,
        exit: formProps.action.exit ? formProps.action.exit.route : ''
      }),
      inputs: this.formBuilder.array(this.makeEmptyInputProps(formProps.inputs))
    });
  }

  saveChanges() {
    this.toggleEditing();

    const routeProps = new RoutePropertiesFromForm(this.routePropsForm, this.projectMap);
    this.routeProperties = routeProps.make();
    this.routeFound = true;
    this.projectMap.setRoute(this.routeProperties);

    const newGlobalExits = routeProps.newGlobalExits();
    if ( newGlobalExits.length ) {
      this.globalExits.push(...newGlobalExits);
      this.projectMap.setGlobalExits(this.globalExits);
      this.loadRoutePropsForm();
    }
  }

  saveFormChanges() {
    this.toggleEditing();

    const idx = this.visibleForm.index;
    this.routeProperties.forms[idx].action.name = this.formPropsForm.get('action.name').value;
    this.routeProperties.forms[idx].action.description = this.formPropsForm.get('action.description').value;
    this.routeProperties.forms[idx].action.button = {
      type: 'button',
      label: this.formPropsForm.get('action.button').value,
      attributes: ''
    } as FormInput;

    const exitRoute = this.formPropsForm.get('action.exit').value;
    const normalizedExitRoute = this.projectMap.normalizeRoute(exitRoute);
    if ( exitRoute.length > 0 && normalizedExitRoute !== this.currentURL ) {
      this.routeProperties.forms[idx].action.exit = {
        visibleText: '',
        route: normalizedExitRoute,
        routeLocations: ['']
      } as Exit;
    } else {
      delete this.routeProperties.forms[idx].action.exit;
    }

    this.routeProperties.forms[idx].inputs = this.formPropsForm.get('inputs').value.filter((input: FormInput) => {
      return input.label !== '' || input.value !== '' || input.attributes !== '';
    }) as FormInput[];

    this.projectMap.setRoute(this.routeProperties);
  }

  export() {
    this.projectMap.export();
  }

  reset() {
    if ( window.confirm('Are you sure you want to reset your project?') ) {
      this.projectMap.reset();
      this.setUp();
    }
  }

  private makeEmptyExitProps(routeExits: Exit[] = []) {
    const exits = [];

    routeExits.forEach((exit: Exit) => {
      exits.push(this.makeExitProp(exit));
    });
    const emptyExits = Array
      .apply(null, Array(Math.max(1, 5 - exits.length)))
      .map(() => this.makeExitProp());

    return exits.concat(emptyExits);
  }

  public addExitProp(index: number) {
    const exits = this.routePropsForm.get('exits') as FormArray;
    if ( index === exits.length - 1 ) {
      exits.push(this.makeExitProp());
    }
  }

  private makeExitProp(exitProps: Exit = null): FormGroup {
    const selectedLocations = ( exitProps )
      ? exitProps.routeLocations.map((loc: string) => (loc.length ? loc : 'general'))
      : ['general'];
    return this.formBuilder.group({
      exitType: 'Link',
      action: exitProps ? exitProps.route : '',
      visibleText: exitProps ? exitProps.visibleText : '',
      visibleLocations: this.formBuilder.array(
        this.exitLocations.map((loc: string) => this.formBuilder.group({
          label: loc,
          selected: selectedLocations.indexOf(loc) > -1
        }))
      )
    });
  }

  private makeEmptyFormProps(routeForms: Form[] = []) {
    const forms = [];

    routeForms.forEach((form: Form) => {
      forms.push(this.makeFormProp(form));
    });
    forms.push(this.makeFormProp());

    return forms;
  }

  public addFormProp(index: number) {
    const forms = this.routePropsForm.get('forms') as FormArray;
    if ( index === forms.length - 1 ) {
      forms.push(this.makeFormProp());
    }
  }

  private makeFormProp(formProps: Form = null): FormGroup {
    const selectedLocations = ( formProps && formProps.action.exit && formProps.action.exit.routeLocations )
      ? formProps.action.exit.routeLocations.map((loc: string) => (loc.length ? loc : 'general'))
      : ['general'];
    return this.formBuilder.group({
      exitType: 'Form',
      action: formProps ? formProps.action.name : '',
      visibleText: formProps ? formProps.action.button.label : '',
      visibleLocations: this.formBuilder.array(
        this.formLocations.map((loc: string) => this.formBuilder.group({
          label: loc,
          selected: selectedLocations.indexOf(loc) > -1
        }))
      )
    });
  }

  private makeEmptyInputProps(formInputs: FormInput[]) {
    const inputs = [];

    formInputs.forEach((input: FormInput) => {
      inputs.push(this.makeInputProp(input));
    });
    inputs.push(this.makeInputProp());

    return inputs;
  }

  addInputProp(index: number) {
    const inputs = this.formPropsForm.get('inputs') as FormArray;
    if ( index === inputs.length - 1 ) {
      inputs.push(this.makeInputProp());
    }
  }

  private makeInputProp(inputProps: FormInput = null) {
    return this.formBuilder.group({
      type: inputProps ? inputProps.type : 'text',
      label: inputProps ? inputProps.label : '',
      attributes: inputProps ? inputProps.attributes : '',
      value: inputProps ? inputProps.value : ''
    });
  }

}
