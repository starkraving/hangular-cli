import { Exit } from './exit';
import { Form } from './form';

export interface RouteProperties {
    route: string;
    description: string;
    dasherizedName?: string;
    componentName?: string;
    exits: Exit[];
    forms: Form[];
}