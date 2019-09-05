import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThemeHandlerComponent } from './components/theme-handler/theme-handler.component';
import { ScaffularPreflightComponent } from './components/preflight/preflight.component';

const routes: Routes = [
  {path: 'scaffular/preflight', component: ScaffularPreflightComponent},
  {path: '**', component: ThemeHandlerComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class ScaffularRoutingModule { }
