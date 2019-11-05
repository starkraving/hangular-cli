import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import templateProps from '../../prototype/templateProps.json';

@Component({
  selector: 'app-route-properties',
  templateUrl: './route-properties.component.html',
  styleUrls: ['./route-properties.component.scss']
})
export class RoutePropertiesComponent implements OnInit {
  @Input() visibleForm: any;
  @Input() routePropsForm: FormGroup;
  @Input() currentURL: string;
  @Input() formPropsForm: FormGroup;
  @Input() formLocations: string[];
  @Input() exitLocations: string[];

  @Output() saveChanges = new EventEmitter();
  @Output() addFormProp = new EventEmitter<number>();
  @Output() addExitProp = new EventEmitter<number>();
  @Output() addInputProp = new EventEmitter<number>();
  @Output() toggleEditing = new EventEmitter();
  @Output() saveFormChanges = new EventEmitter();

  exitTypes: string[] = ['Form', 'Link', 'Global'];
  inputTypes: string[] = ['text', 'email', 'number', 'range', 'url', 'password', 'select', 'radio', 'checkbox', 'file'];
  hasPrototype: boolean = false;

  ngOnInit() {
    this.hasPrototype = ( ( this.formLocations.length !== 1 || this.formLocations[0].toLowerCase() !== 'general' ) &&
      ( this.exitLocations.length !== 2 || this.exitLocations.indexOf('general') === -1 || this.exitLocations.indexOf('global') === -1 ));
  }

  _saveChanges() {
    this.saveChanges.emit();
  }

  _addFormProp(index: number) {
    this.addFormProp.emit(index);
  }

  _addExitProp(index: number) {
    this.addExitProp.emit(index);
  }

  _addInputProp(index: number) {
    this.addInputProp.emit(index);
  }

  _toggleEditing() {
    this.toggleEditing.emit();
  }

  _saveFormChanges() {
    this.saveFormChanges.emit();
  }

}
