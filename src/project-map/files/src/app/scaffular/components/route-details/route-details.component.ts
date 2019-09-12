import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormInput } from '../../model/form-input';
import { RouteProperties } from '../../model/route-properties';
import { Exit } from '../../model/exit';

@Component({
  selector: 'app-route-details',
  templateUrl: './route-details.component.html',
  styleUrls: ['./route-details.component.scss']
})
export class RouteDetailsComponent implements OnInit {
  @Input() currentURL: string;
  @Input() routeFound: boolean;
  @Input() routeProperties: RouteProperties;
  @Input() visibleForm: any;
  @Input() globalExits: Exit[];

  @Output() showForm = new EventEmitter<number>();

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  _showForm(formIndex: number) {
    this.showForm.emit(formIndex);
  }

  getInputMocks(formIndex: number) {
    const form = this.routeProperties.forms[formIndex];
    const inputMocks = [] as string[];
    form.inputs.forEach((input: FormInput, idx: number) => {
      let tag = '';
      let closeTag = '';
      let innerHTML = '';
      switch ( input.type ) {
        case 'select' :
          tag = '<label>' + input.label + ': <select';
          if ( input.attributes.length > 0 ) {
            tag += ' ' + input.attributes;
          }
          tag += '>';
          innerHTML = input.value.split(',').map((value: string) => {
            return '<option value="' + value + '">' + value + '</option>';
          }).join('');
          closeTag = '</select></label>';
          break;

        case 'radio' :
        case 'checkbox' :
          tag = '<dl><dt>' + input.label + ':</dt>';
          innerHTML = input.value.split(',').map((value: string, vIdx: number) => {
            const name = `form${formIndex}_${idx}`;
            const id = `${name}_${vIdx}`;
            let str = `<dd><input type="${input.type}" name="${name}" id="${id}"`;
            if ( input.attributes.length > 0 ) {
              str += ` ${input.attributes}`;
            }
            str += `> <label for="${id}">${value}</label></dd>`;
            return str;
          }).join('');
          closeTag = '</dl>';
          break;

        default :
          tag = '<label>' + input.label + ': <input type="' + input.type + '"';
          if ( input.value.length > 0 ) {
            tag += ' value="' + input.value + '"';
          }
          if ( input.attributes.length > 0 ) {
            tag += ' ' + input.attributes;
          }
          tag += '>';
          break;
      }
      inputMocks.push(tag + innerHTML + closeTag);
    });
    return inputMocks;
  }


}
