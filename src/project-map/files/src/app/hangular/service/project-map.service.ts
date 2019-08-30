import { Injectable } from '@angular/core';
import { Exit } from '../model/exit';
import { Project } from '../model/project';
import projectData from '../model/project.json';
import { RouteProperties } from '../model/route-properties';

@Injectable({
  providedIn: 'root'
})
export class ProjectMapService {

  projectData: Project;

  constructor() {
    this.projectData = projectData;
  }

  getRoute(route: string) {
    const found = this.findRoute(route);
    return (found > -1) ? this.projectData.routes[found] : undefined;
  }

  setRoute(routeProps: RouteProperties) {
    routeProps.route = this.normalizeRoute(routeProps.route);
    const found = this.findRoute(routeProps.route);
    if (found > -1) {
      this.projectData.routes[found] = routeProps;
    } else {
      this.projectData.routes.push(routeProps);
    }
  }

  findRoute(route: string): number {
    route = this.normalizeRoute(route);
    return this.projectData.routes.findIndex((routeProps: RouteProperties) => routeProps.route === route);
  }

  normalizeRoute(route: string): string {
    if ( route === '' ) {
      route = '/';
    }
    return route;
  }

  getGlobalExits() {
    return this.projectData.globalExits;
  }

  setGlobalExits(globalExits: Exit[]) {
    this.projectData.globalExits = globalExits;
  }

  export() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(this.projectData)], {type: 'application/json'})
    );
    a.download = 'project.json';
    a.click();
  }

  reset() {
    this.projectData = {
      routes: [
        {
          route: '/',
          description: 'Homepage for the website',
          exits: [],
          forms: []
        }
      ],
      globalExits: [
        {
          route: '/',
          visibleText: 'Home',
          routeLocations: ['']
        }
      ]
    };
  }
}
