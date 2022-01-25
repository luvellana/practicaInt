import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {JefeDeCarreraComponent} from "./jefe-de-carrera/jefe-de-carrera.component";
import {GoogleLogInComponent} from "./google-log-in/google-log-in.component";


const routes: Routes = [
  {path: '', component: GoogleLogInComponent},
  {path: 'seguimiento', component: JefeDeCarreraComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
