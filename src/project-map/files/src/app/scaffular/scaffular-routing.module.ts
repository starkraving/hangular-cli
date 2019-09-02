import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThemeHandlerComponent } from './components/theme-handler/theme-handler.component';

const routes: Routes = [
  {path: '**', component: ThemeHandlerComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class ScaffularRoutingModule { }
