import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MateriasService} from "../services/materias.service";
import {AlertComponent} from "../alert/alert.component";

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent  implements OnInit{

  constructor(@Inject(MAT_DIALOG_DATA) public data,public dialogRef: MatDialogRef<DeleteComponent>,private materiaService:MateriasService,public dialog: MatDialog) { }


  confirmDeletion() {
    if(this.data.def == "materia"){
      let idDocAn: string;
      if(this.data.docenteAc.length==0){
        idDocAn = "";
      }else{
        idDocAn = "/"+this.data.docenteAc[0];
      }
      this.materiaService.deleteMateria(this.data.element,idDocAn).subscribe(
        res=>{
          this.dialogRef.close();
          if(res.status==200) {
            this.dialog.open(AlertComponent, {width:'300px',data:{action:"Eliminar",message:"Materia eliminada exitosamente"}});
          }
        },error => {
          console.log(error);
          this.dialog.open(AlertComponent, {width:'300px',data:{action:"Error",message:"Error al eliminar materia"}});
        }
      )
    }else if(this.data.def == "docente"){
      this.materiaService.deleteDocente(this.data.element).subscribe(
        res=>{
          this.dialogRef.close();
          if(res.status==200) {
            this.dialog.open(AlertComponent, {width:'300px',data:{action:"Eliminar",message:"Docente eliminado exitosamente"}});
          }
        },error => {
          console.log(error);
          this.dialog.open(AlertComponent, {width:'300px',data:{action:"Error",message:"Error al eliminar docente"}});
        }
      )
    }else if(this.data.def == "usuario"){
      this.materiaService.deleteUsuarios(this.data.element._id).subscribe(
        res=>{
          this.dialogRef.close();
          if(res.status==200) {
            this.dialog.open(AlertComponent, {width:'300px',data:{action:"Eliminar",message:"Usuario eliminado exitosamente"}});
          }
        },error => {
          console.log(error);
          this.dialog.open(AlertComponent, {width:'300px',data:{action:"Error",message:"Error al eliminar usuario"}});
        }
      )
    }
  }

  cancelDeletion() {
    this.dialogRef.close()
  }

  enviarMail() {
    let body = {
      "destino": this.data.docente[0].email,
      "materia": this.data.materia.nombre,
      "inicio": this.data.materia.inicio,
      "fin": this.data.materia.fin,
      "idjc": this.data.materia.id_jefe_carrera,
      "nombre_completo_docente": this.data.docente[0].nombre + ' ' + this.data.docente[0].apellido_paterno + ' ' + this.data.docente[0].apellido_materno, 
      "asunto": this.data.asunto
    };
    console.log(body);
    this.materiaService.sendMail(body).subscribe(
      res=>{
        this.dialogRef.close();
        this.dialog.open(AlertComponent, {width:'300px',data:{action:"Éxito",message:"Email enviado"}});
      },error=>{
        console.log(error);
        this.dialog.open(AlertComponent, {width:'300px',data:{action:"Error",message:"No se pudo enviar el email"}});
    }
    )
  }

  ngOnInit() {
    //console.log(this.data)
  }
}
