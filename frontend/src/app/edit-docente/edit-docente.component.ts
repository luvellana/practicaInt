import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MateriasService} from "../services/materias.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertComponent} from "../alert/alert.component";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {Docente} from "../models/docente";

@Component({
  selector: 'app-edit-docente',
  templateUrl: './edit-docente.component.html',
  styleUrls: ['./edit-docente.component.css']
})
export class EditDocenteComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data, private materiaService: MateriasService,public dialogRef: MatDialogRef<EditDocenteComponent>, public dialog: MatDialog) {

  }
  public dataSourceUsuarios=[];
  myControlUsuarios = new FormControl();
  filterOptionsUsuarios:Observable<string[]>;
  ngOnInit() {
    this.getUsuarios();
    this.filterOptionsUsuarios = this.myControlUsuarios.valueChanges.pipe(
      startWith(''),
      map(value=>this._filterUsuarios(value.toString()))
    );
  }
  getUsuarios() {
    this.materiaService.getUsuarios().subscribe(
      res => {
        this.dataSourceUsuarios = res;
      }, err => {
        //console.log(err);
      }
    );
  }


  form: FormGroup = new FormGroup({
    nombre: new FormControl(this.data.docente.nombre,Validators.required),
    segundo_nombre: new FormControl(this.data.docente.segundo_nombre),
    apellido_paterno: new FormControl(this.data.docente.apellido_paterno,Validators.required),
    apellido_materno: new FormControl(this.data.docente.apellido_materno),
    email: new FormControl(this.data.docente.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")),
    horas_planta: new FormControl(this.data.docente.horas_planta, [Validators.required,Validators.pattern('^\\d*$')]),
    id_jefe_carrera: new FormControl(this.data.docente.id_jefe_carrera,Validators.required)
  });

  onSubmit(){
    //console.log(this.data.jefe);
    if((+this.form.value.horas_planta)<(+this.data.docente.horas_cubiertas)){
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"El docente ya cubre con más horas de planta que las indicadas"}});
    }else if(!this.data.docente.id_jefe_carrera){
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Asignar un jefe de carrera encargado"}});
    } else{
      this.form.value.id_jefe_carrera=this.data.docente.id_jefe_carrera;
      //console.log(this.form.value);
      this.materiaService.putDocente(this.data.docente._id,this.form.value).subscribe(
        res=>{
          this.dialogRef.close();
          if(res.status==200) {
            this.dialog.open(AlertComponent, {width:'300px',data:{action:"Modificación",message:"Docente modificado exitosamente"}});
          }
        },error => {
          //console.log(error);
          this.dialog.open(AlertComponent, {width:'300px',data:{action:"Error",message:"Error al modificar docente"}});
        }
      )
    }
  }

  private _filterUsuarios(value: string) {
    const filterValue = value.toLowerCase();
    return this.dataSourceUsuarios.filter(option=>option.rol=="jefe_carrera").filter(option=>(option.nombre_corto).toLowerCase().includes(filterValue));
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
