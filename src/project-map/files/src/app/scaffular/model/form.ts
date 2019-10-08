import { FormAction } from './form-action';
import { FormInput } from './form-input';

export interface Form {
    action: FormAction;
    inputs: FormInput[];
    index?: number;
};
