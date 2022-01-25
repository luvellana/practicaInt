import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, NgForm, Validators} from "@angular/forms";
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats, NativeDateAdapter} from "@angular/material/core";
import {MateriasService} from "../services/materias.service";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {Docente} from "../models/docente";
import {AlertComponent} from "../alert/alert.component";

export class AppDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === "input") {
      let day: string = date.getDate().toString();
      day = +day < 10 ? "0" + day : day;
      let month: string = (date.getMonth() + 1).toString();
      month = +month < 10 ? "0" + month : month;
      let year = date.getFullYear();
      return `${year}-${month}-${day}`;
    }
    return date.toDateString();
  }
}export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: "short", year: "numeric", day: "numeric" },
  },
  display: {
    dateInput: "input",
    monthYearLabel: { year: "numeric", month: "numeric" },
    dateA11yLabel: { year: "numeric", month: "long", day: "numeric"
    },
    monthYearA11yLabel: { year: "numeric", month: "long" },
  }
};
@Component({
  selector: 'app-edit-materia',
  templateUrl: './edit-materia.component.html',
  styleUrls: ['./edit-materia.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class EditMateriaComponent implements OnInit {
  public docenteAntiguo:string;
  public dataSourceDocentes=[];
  myControlDocentes = new FormControl();
  filterOptionsDocentes: Observable<string[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public data, private materiaService: MateriasService,public dialogRef: MatDialogRef<EditMateriaComponent>, public dialog: MatDialog) {

  }

  ngOnInit() {
    if(this.data.docente.length == 0){
      this.docenteAntiguo = "";
    }else{
      this.docenteAntiguo = this.data.docente[0]._id.toString();
    }
    this.getDocentes();
    this.getUsuarios();
    this.filterOptionsUsuarios = this.myControlUsuarios.valueChanges.pipe(
      startWith(''),
      map(value=>this._filterUsuarios(value.toString()))
    );
    this.filterOptionsDocentes = this.myControlDocentes.valueChanges.pipe(
      startWith(''),
      map(value=>this._filterDocentes(value.toString()))
    );
  }
  getDocentes() {
    this.materiaService.getDocentesAnyWay().subscribe(
      res => {
        this.dataSourceDocentes = res;
      }, err => {
        console.log(err);
      }
    );
  }

  public dataSourceUsuarios=[];
  myControlUsuarios = new FormControl();
  filterOptionsUsuarios:Observable<string[]>;

  getUsuarios() {
    this.materiaService.getUsuarios().subscribe(
      res => {
        this.dataSourceUsuarios = res;
      }, err => {
        console.log(err);
      }
    );
  }
  private _filterUsuarios(value: string) {
    const filterValue = value.toLowerCase();
    return this.dataSourceUsuarios.filter(option=>option.rol=="jefe_carrera").filter(option=>(option.nombre_corto).toLowerCase().includes(filterValue));
  }

  form: FormGroup = new FormGroup({
    nombre: new FormControl(this.data.materia.nombre,Validators.required),
    inicio: new FormControl(this.data.materia.inicio, Validators.required),
    fin: new FormControl(this.data.materia.fin, Validators.required),
    id_docente: new FormControl(''),
    horas_totales: new FormControl(this.data.materia.horas_totales, [Validators.required,Validators.pattern('^\\d*$')]),
    horas_planta: new FormControl(this.data.materia.horas_planta,Validators.pattern('^\\d*$')),
    id_jefe_carrera: new FormControl(this.data.materia.id_jefe_carrera, Validators.required),
    aula: new FormControl(this.data.materia.aula)
  });

  onSubmit() {
    if(!this.form.value.id_jefe_carrera){
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Asignar un jefe de carrera encargado"}});
    }else if (this.data.docente && this.data.docente[0] && (this.form.value.horas_planta==null || this.form.value.horas_planta.toString()=="")) {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Asignar horas de planta al docente"}});
    } else if (this.data.docente && !this.data.docente[0] && this.form.value.horas_planta != "") {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Seleccionar un docente"}});
    } else if ((+this.form.value.horas_totales) < (+this.form.value.horas_planta)) {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Las horas de planta no deben superar las horas totales de la meteria"}});
    } else if (this.data.docente && (this.data.materia.horas_planta < this.form.value.horas_planta) && ((parseInt(this.data.docente[0].horas_planta) - parseInt(this.data.docente[0].horas_cubiertas)) < (parseInt(this.form.value.horas_planta) - parseInt(this.data.materia.horas_planta)))) {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Las horas de planta faltantes del docente son menores a las horas de planta indicadas"}});
    } else {
      if (this.data.docente && this.data.docente[0]) {
        this.form.value.id_docente = this.data.docente[0]._id;
      } else {
        this.form.value.id_docente = "";
        this.form.value.horas_planta = "0";
      }
      this.form.value.id_jefe_carrera = this.data.materia.id_jefe_carrera;
      //console.log(this.form.value);
      this.materiaService.putMateria(this.data.materia._id, this.form.value,this.docenteAntiguo).subscribe(
        res => {
          this.dialogRef.close();
          if(res.status==200) {
            this.dialog.open(AlertComponent, {width:'300px',data:{action:"Modificación",message:"Materia modificada exitosamente"}});
            console.log(this.form.value);
          }
        }, error => {
          console.log(error);
          this.dialog.open(AlertComponent, {width:'300px',data:{action:"Error",message:"Error al modificar materia"}});
        }
      )
    }
  }

  private _filterDocentes(value: string) {
    const filterValue = value.toLowerCase();
    return this.dataSourceDocentes.filter(option=>(option.nombre+" "+option.segundo_nombre+" "+option.apellido_paterno+" "+option.apellido_materno).toLowerCase().includes(filterValue));
  }

  displayDocente(subject) : string {
    if(subject){
      if(subject.segundo_nombre!=""){
        return subject.nombre+" "+subject.segundo_nombre+" "+subject.apellido_paterno+" "+subject.apellido_materno
      }else{
        return subject.nombre+" "+subject.apellido_paterno+" "+subject.apellido_materno
      }
    }else{
      return ""
    }
  }

  displayDocente2(subject) {
    if(subject instanceof Docente || (subject && subject.nombre)) {
      if(subject.segundo_nombre!=""){
        return subject.nombre+" "+subject.segundo_nombre+" "+subject.apellido_paterno+" "+subject.apellido_materno
      }else{
        return subject.nombre+" "+subject.apellido_paterno+" "+subject.apellido_materno
      }
    }else{
      return subject
    }
  }

  displayUsuario(subject) {
    if(subject && subject.nombre_corto){
      return subject.nombre_corto
    }else{
      return subject
    }

  }

  displayUsuario2(subject) {
    if(subject &&   subject.nombre_corto){
      return subject.nombre_corto
    }else{
      return subject
    }
  }


}
