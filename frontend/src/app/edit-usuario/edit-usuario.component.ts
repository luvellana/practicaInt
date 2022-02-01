import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MateriasService} from "../services/materias.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertComponent} from "../alert/alert.component";

@Component({
  selector: 'app-edit-usuario',
  templateUrl: './edit-usuario.component.html',
  styleUrls: ['./edit-usuario.component.css']
})
export class EditUsuarioComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data, private materiaService: MateriasService,public dialogRef: MatDialogRef<EditUsuarioComponent>, public dialog: MatDialog) {

  }

  form: FormGroup = new FormGroup({
    nombre: new FormControl(this.data.usuario.nombre,Validators.required),
    segundo_nombre: new FormControl(this.data.usuario.segundo_nombre),
    apellido_paterno: new FormControl(this.data.usuario.apellido_paterno, Validators.required),
    apellido_materno: new FormControl(this.data.usuario.apellido_materno,Validators.required),
    email: new FormControl(this.data.usuario.email, Validators.required),
    rol: new FormControl(this.data.usuario.rol,Validators.required),
    super_usuario: new FormControl(this.data.usuario.super_usuario),
    nombre_corto: new FormControl(this.data.usuario.nombre_corto),
    ver_pendientes_pasadas: new FormControl(this.data.usuario.ver_pendientes_pasadas),
    ver_evaluacion_pares: new FormControl(this.data.usuario.ver_evaluacion_pares),
    ver_horas_no_asignadas: new FormControl(this.data.usuario.ver_horas_no_asignadas),
  });


  onSubmit() {
    if ((this.form.value.rol == "asistente" || this.form.value.rol == "registros" || this.form.value.rol == "contabilidad") && this.form.value.super_usuario) {
      this.dialog.open(AlertComponent, {
        width: '300px',
        data: {action: "Conflicto", message: "Solo decanos y jefes de carrera pueden ser super usuarios"}
      });
    } else if(this.form.value.rol == "jefe_carrera" && (this.form.value.nombre_corto == ""||this.form.value.nombre_corto == null)) {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Asignar nombre corto al jefe de carrera"}});
    }else if(this.form.value.rol != "jefe_carrera" && this.form.value.nombre_corto != "") {
      this.dialog.open(AlertComponent, {width:'300px',data:{action:"Conflicto",message:"Solo jefes de carrera deben tener nobre corto"}});
    }else {
      this.materiaService.putUsuarios(this.form.value, this.data.usuario._id).subscribe(
        res => {
          this.dialogRef.close();
          if (res.status == 200) {
            this.dialog.open(AlertComponent, {
              width: '300px',
              data: {action: "Modificación", message: "Usuario modificado exitosamente"}
            });
          }
        }, error => {
          //console.log(error);
          this.dialog.open(AlertComponent, {
            width: '300px',
            data: {action: "Error", message: "Error al modificar usuario"}
          });
        }
      )

    }


  }
}
