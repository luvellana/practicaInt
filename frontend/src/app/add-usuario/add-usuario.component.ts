import { Component, OnInit } from '@angular/core';
import {MateriasService} from "../services/materias.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AlertComponent} from "../alert/alert.component";

@Component({
  selector: 'app-add-usuario',
  templateUrl: './add-usuario.component.html',
  styleUrls: ['./add-usuario.component.css']
})
export class AddUsuarioComponent implements OnInit {

  constructor(private materiaService: MateriasService,public dialogRef: MatDialogRef<AddUsuarioComponent>, public dialog: MatDialog) { }

  ngOnInit() {
  }

  form: FormGroup = new FormGroup({
    nombre: new FormControl('',Validators.required),
    segundo_nombre: new FormControl(''),
    apellido_paterno: new FormControl('', Validators.required),
    apellido_materno: new FormControl('',Validators.required),
    email: new FormControl('', Validators.required),
    rol: new FormControl('',Validators.required),
    nombre_corto: new FormControl(''),
    super_usuario: new FormControl(false,Validators.required),
    ver_pendientes_pasadas: new FormControl(false),
    ver_evaluacion_pares: new FormControl(false),
    ver_horas_no_asignadas: new FormControl(false),
    preferencias_seguimiento: new FormControl({
      "silabo_subido": true,
      "aula_revisada": true,
      "examen_revisado": true,
      "contrato_impreso": true,
      "contrato_firmado": true,
      "planilla_lista": true,
      "planilla_firmada": true,
      //"cheque_solicitado": true,
      "cheque_recibido": true,
      "horas_totales": true,
      "horas_planta": true}),
    preferencias: new FormControl({
      "silabo_subido": true,
      "aula_revisada": true,
      "examen_revisado": true,
      "contrato_impreso": true,
      "contrato_firmado": true,
      "planilla_lista": true,
      "planilla_firmada": true,
      //"cheque_solicitado": true,
      "cheque_recibido": true,
      "horas_totales": true,
      "horas_planta": true
    })
  });

  onSubmit() {
    //console.log(this.form.value);
    if((this.form.value.rol == "asistente" || this.form.value.rol == "registros" || this.form.value.rol == "contabilidad") && this.form.value.super_usuario){
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Solo los decanos y jefes de carrera pueden ser super usuarios"}});
    }else if(this.form.value.rol == "jefe_carrera" && (this.form.value.nombre_corto == ""||this.form.value.nombre_corto == null)) {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Asignar nombre corto al jefe de carrera"}});
    }else if(this.form.value.rol != "jefe_carrera" && (this.form.value.nombre_corto != "")) {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Solo jefes de carrera deben tener nobre corto"}});
    }else{
      this.materiaService.postUsuarios(this.form.value).subscribe(
        res=>{
          this.dialogRef.close();
          if(res.status==200) {
            this.dialog.open(AlertComponent, {width:'300px',data:{action:"Adición",message:"Usuario añadido exitosamente"}});
          }
        }, error => {
          //console.log(error);
        }
      );
    }
  }
}
