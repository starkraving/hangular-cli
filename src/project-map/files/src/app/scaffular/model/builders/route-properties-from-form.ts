import { FormGroup } from '@angular/forms';
import { ProjectMapService } from '../../service/project-map.service';
import { Exit } from '../exit';
import { Form } from '../form';
import { RouteProperties } from '../route-properties';

export class RoutePropertiesFromForm {
  private route: string;
  private description: string;
  private forms: Form[] = [];
  private exits: Exit[] = [];
  private globalExits: Exit[] = [];
  private existingRouteProps: RouteProperties;
  private projectMap: ProjectMapService;

  constructor(
    form: FormGroup,
    projectMap: ProjectMapService
  ) {
    this.projectMap = projectMap;
    this.route = this.projectMap.normalizeRoute(form.get('route').value);
    this.description = form.get('description').value;
    this.existingRouteProps = this.projectMap.getRoute(this.route);
    this.funnelActionsIntoTypes(form.get('forms').value);
    this.funnelActionsIntoTypes(form.get('exits').value);
  }

  funnelActionsIntoTypes(arrayItems) {
    arrayItems.forEach((props, idx: number) => {
      if (props.action.length === 0) {
        return;
      }
      switch (props.exitType) {
        case 'Form' :
          const formProps = (this.existingRouteProps && this.existingRouteProps.forms.length > idx)
            ? this.existingRouteProps.forms[idx]
            : {
              action: {
                name: '',
                description: '',
                button: {
                  attributes: '',
                  type: 'button',
                  label: ''
                }
              },
              inputs: []
            };
          formProps.action.name = props.action;
          formProps.action.button.label = props.visibleText;
          formProps.action.exit = formProps.action.exit || {
            route: '',
            visibleText: '',
            routeLocations: []
          } as Exit;
          formProps.action.exit.routeLocations = props.visibleLocations
            .filter(loc => loc.selected)
            .map(loc => loc.label);
          this.forms.push(formProps);
          break;

        case 'Link' :
          this.exits.push({
            route: props.action,
            visibleText: props.visibleText,
            routeLocations: props.visibleLocations
              .filter(loc => loc.selected)
              .map(loc => loc.label)
          });
          break;

        case 'Global' :
          this.globalExits.push({
            route: props.action,
            visibleText: props.visibleText,
            routeLocations: props.visibleLocations
              .filter(loc => loc.selected)
              .map(loc => loc.label)
          });
          break;
      }
    });
  }

  make() {
    return {
      route: this.route,
      description: this.description,
      forms: this.forms,
      exits: this.exits
    } as RouteProperties;
  }

  newGlobalExits() {
    return this.globalExits;
  }
}
