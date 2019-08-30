import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HangularRoutingModule } from './hangular-routing.module';
import { ThemeHandlerComponent } from './components/theme-handler/theme-handler.component';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
import { RouteDetailsComponent } from './components/route-details/route-details.component';
import { RoutePropertiesComponent } from './components/route-properties/route-properties.component';

@NgModule({
  declarations: [ThemeHandlerComponent, SafeHtmlPipe, RouteDetailsComponent, RoutePropertiesComponent],
  imports: [
    CommonModule,
    HangularRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class HangularModule { }
