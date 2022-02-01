import {Component, Input, OnInit} from '@angular/core';
import {MateriasService} from "../services/materias.service";
import {FormGroup, NgForm, Validators} from "@angular/forms";
import {Docente} from "../models/docente";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {Materia} from "../models/materia";
import {DocentePost} from "../models/docentePost";
import {MateriaPost} from "../models/materiaPost";
import {Super} from "../models/super";
import {MatTableDataSource} from "@angular/material/table";
import {PreferenciasDocente, PreferenciasPendientes, Usuario} from "../models/usuario";
import {VariableAst} from "@angular/compiler";
import {AlertComponent} from "../alert/alert.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-add-docente',
  templateUrl: './add-docente.component.html',
  styleUrls: ['./add-docente.component.css']
})
export class AddDocenteComponent implements OnInit {
  public preferencias:PreferenciasPendientes;
  public preferenciasDoc:PreferenciasDocente;
  public dataSourceUsuarios=[];
  public docente:Docente;
  public usuario:Usuario;
  public super: Super;
  constructor(private materiaService: MateriasService,public dialogRef: MatDialogRef<AddDocenteComponent>, public dialog: MatDialog) {
    this.preferencias = new PreferenciasPendientes('',false,false,false,false,false,false,false,false,false,false);
    this.preferenciasDoc = new PreferenciasDocente('',false,false,false,false);
    this.usuario = new Usuario('','','','','','',0,'',false,this.preferencias,this.preferencias,'',false,false,false);
    this.super = new Super();
    this.super.docente = this.docente;
    this.super.usuario = this.usuario;
  }
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
  private _filterUsuarios(value: string) {
    const filterValue = value.toLowerCase();
    return this.dataSourceUsuarios.filter(option=>option.rol=="jefe_carrera" ).filter(option=>(option.nombre+" "+option.segundo_nombre+" "+option.apellido_paterno+" "+option.apellido_materno).toLowerCase().includes(filterValue));
  }

  form: FormGroup = new FormGroup({
    nombre: new FormControl('',Validators.required),
    segundo_nombre: new FormControl(''),
    apellido_paterno: new FormControl('', Validators.required),
    apellido_materno: new FormControl(''),
    email: new FormControl('',Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")),
    materias_asignadas: new FormControl(0),
    horas_planta: new FormControl('', [Validators.required,Validators.pattern('^\\d*$')]),
    horas_cubiertas: new FormControl(0),
    evaluacion_pares: new FormControl(false),
    id_jefe_carrera: new FormControl(),
  });


  onSubmit() {
    if(!this.super.usuario._id){
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Asignar un jefe de carrera encargado"}});
    }else{
      this.form.value.id_jefe_carrera=this.super.usuario.nombre_corto;
      this.materiaService.postDocente(this.form.value).subscribe(
        res=>{
          this.dialogRef.close();
          if(res.status==200) {
            this.dialog.open(AlertComponent, {width:'300px',data:{action:"Adición",message:"Docente añadido exitosamente"}});
          }
        },error => {
          //console.log(error);
          this.dialog.open(AlertComponent, {width:'300px',data:{action:"Error",message:"Error al añadir docente"}});
        }
      );
    }

  }

  displayUsuario(subject) : string {
    if(subject && subject.nombre){
      return subject.nombre_corto;
    }else{
      return ""
    }
  }

  displayUsuario2(subject) {
    if((subject && subject.nombre)) {
      return subject.nombre_corto;
    }else{
      return "";
    }
  }

}
