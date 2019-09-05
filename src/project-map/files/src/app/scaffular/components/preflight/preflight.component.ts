import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectMapService } from '../../service/project-map.service';
import { RouteComponentBuilder } from '../../model/builders/route-component-builder';
import { makeComponentNameFromRoute, dasherize } from '../../common/helpers';

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

      if ( 'component' === this.view && this.routeIndex ) {
        if ( this.projectMap.projectData.routes.length > this.routeIndex ) {
          let routeProps = this.projectMap.projectData.routes[this.routeIndex];
          routeProps.componentName = routeProps.componentName || makeComponentNameFromRoute(routeProps.route);
          routeProps.dasherizedName = dasherize(routeProps.componentName.replace(/Component$/, ''));
          const routeComponentBuilder = new RouteComponentBuilder(routeProps);
          this.code = routeComponentBuilder.toString();
        }
      }
    }
  }
