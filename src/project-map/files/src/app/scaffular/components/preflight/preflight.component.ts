import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectMapService } from '../../service/project-map.service';
import { RouteComponentBuilder } from '../../model/builders/route-component-builder';
import { makeComponentNameFromRoute, dasherize } from '../../common/helpers';
import { RouteTemplateBuilder } from '../../model/builders/route-template-builder';
import templateProps from '../../prototype/templateProps.json';

@Component({
    selector: 'app-scaffular-preflight',
    templateUrl: './preflight.component.html'
  })
  export class ScaffularPreflightComponent implements OnInit {
    private view: string = 'summary';
    private routeIndex;
    private code: string;

    constructor(
      private activatedRoute: ActivatedRoute,
      private projectMap: ProjectMapService) {}

    ngOnInit() {
      this.view = this.activatedRoute.snapshot.queryParamMap.get('view');
      this.routeIndex = this.activatedRoute.snapshot.queryParamMap.get('i');

      if ( ['component', 'template'].indexOf(this.view) > -1 && this.routeIndex ) {
        if ( this.projectMap.projectData.routes.length > this.routeIndex ) {
          const routeProps = this.projectMap.projectData.routes[this.routeIndex];
          routeProps.componentName = routeProps.componentName || makeComponentNameFromRoute(routeProps.route);
          routeProps.dasherizedName = dasherize(routeProps.componentName.replace(/Component$/, ''));
          const routeCodeBuilder = ( this.view === 'component' )
            ? new RouteComponentBuilder(routeProps)
            : new RouteTemplateBuilder(routeProps, templateProps);
          this.code = routeCodeBuilder.toString();
        }
      }
    }
  }
