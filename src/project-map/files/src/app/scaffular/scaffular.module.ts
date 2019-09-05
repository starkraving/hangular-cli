import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ScaffularRoutingModule } from './scaffular-routing.module';
import { ScaffularPreflightComponent } from './components/preflight/preflight.component';
import { ThemeHandlerComponent } from './components/theme-handler/theme-handler.component';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
import { RouteDetailsComponent } from './components/route-details/route-details.component';
import { RoutePropertiesComponent } from './components/route-properties/route-properties.component';

@NgModule({
  declarations: [
    ThemeHandlerComponent, 
    SafeHtmlPipe, 
    RouteDetailsComponent, 
    RoutePropertiesComponent,
    ScaffularPreflightComponent
  ],
  imports: [
    CommonModule,
    ScaffularRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class ScaffularModule { }
