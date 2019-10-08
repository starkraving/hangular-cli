import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Form } from '../../model/form';
import { Exit } from '../../model/exit';
import { getParamsAsObject } from '../../common/helpers';
import templateProps from '../../prototype/templateProps.json';
import { RouteTemplateBuilder } from '../../model/builders/route-template-builder';

@Component({
  selector: 'app-route-details',
  templateUrl: './route-details.component.html',
  styleUrls: ['./route-details.component.scss']
})
export class RouteDetailsComponent implements OnInit, OnChanges {
  @Input() currentURL: string;
  @Input() routeProperties: any;
  @Input() routeFound: boolean;
  @Input() visibleForm: any;
  @Input() globalExits: Exit[];

  @Output() showForm = new EventEmitter<Form>();

  forms: {};
  links: {};
  description: string;
  templateBuilder: RouteTemplateBuilder;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.updateFromProps();
    this.templateBuilder = new RouteTemplateBuilder(
      ((this.routeProperties) ? this.routeProperties : RouteTemplateBuilder.defaultProps),
      templateProps
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes.hasOwnProperty('routeProperties') ) {
      this.updateFromProps();
    }
    if ( changes.hasOwnProperty('visibleForm') ) {
      this.showOrHideFormsAndLinks();
    }
  }

  private updateFromProps() {
    this.description = this.routeFound ? this.routeProperties.description : 'Route not defined';
    this.loadFormLocations();
    this.loadLinkLocations();
  }

  private showOrHideFormsAndLinks() {
    if ( this.visibleForm !== undefined ) {
      this.forms = {};
      this.links = {};
    } else {
      this.loadFormLocations();
      this.loadLinkLocations();
    }
  }

  private loadFormLocations() {
    if ( !this.routeFound ) {
      this.forms = {};
      return;
    }
    const locations = {};
    this.routeProperties.forms.forEach((form: Form, idx: number) => {
      const locs = form.action.exit && form.action.exit.routeLocations ? form.action.exit.routeLocations : [];
      if ( !locs.join('').length ) {
        locs.push('general');
      }
      const newForm = { ...form };
      newForm.index = idx;
      locs.forEach((loc: string) => {
        if ( !(locations.hasOwnProperty(loc)) ) {
          locations[loc] = [];
        }
        locations[loc].push(newForm);
      });
    });
    this.forms = locations;
  }

  private loadLinkLocations() {
    const locations = {};
    const addLinkToLocation = (linkType: string) => {
      return (exit: Exit) => {
        const newExit = { ...exit };
        let locs = exit.routeLocations || [];
        if ( !locs.join('').length ) {
          locs = [linkType];
        }
        locs.forEach((loc: string) => {
          if ( !locations.hasOwnProperty(loc) ) {
            locations[loc] = [];
          }
          locations[loc].push(newExit);
        });
      };
    };

    this.globalExits.forEach(addLinkToLocation('global'));
    if ( this.routeFound ) {
      this.routeProperties.exits.forEach(addLinkToLocation('general'));
    }
    this.links = locations;
  }

  _showForm(form: Form) {
    this.showForm.emit(form);
  }

  getRouteLink(route: string) {
    return route.split('?')[0];
  }

  getRouteParams(route: string) {
    const parts = route.split('?');
    if ( parts.length < 2 ) {
      return {};
    }
    return getParamsAsObject(parts[1]);
  }

  getInputMocks(form: Form, location: string) {
    return '';
  }


}
