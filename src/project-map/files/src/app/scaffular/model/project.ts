import { Exit } from './exit';
import { RouteProperties } from './route-properties';

export interface Project {
    globalExits: Exit[];
    routes: RouteProperties[];
}
