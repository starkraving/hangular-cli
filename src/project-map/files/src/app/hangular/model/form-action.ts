import { Exit } from './exit';
import { FormInput } from './form-input';

export interface FormAction {
    name: string;
    description: string;
    button: FormInput;
    exit?: Exit;
};