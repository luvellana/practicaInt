import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {TokenService} from "../services/token.service";
import {MateriasService} from "../services/materias.service";
import {Docente} from "../models/docente";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {Pendiente} from "../models/pendientes";

export interface Pendientes {
  materia : string;
  docente : string;
  inicio : string;
  fin : string;
  pendiente: string;
  hecho: boolean;
}
const PENDIENTES: Pendientes[] = [
  {materia: 'Materia1', docente: 'Docente14', inicio: '12/3/20', fin: '3/5/20', pendiente: 'El contrato no ha sido impreso', hecho: false},
  {materia: 'Materia2', docente: 'Docente1', inicio: '12/5/20', fin: '3/5/20', pendiente: 'El contrato no ha sido impreso', hecho: true},
  {materia: 'Materia3', docente: 'Docente5', inicio: '12/7/20', fin: '3/8/20', pendiente: 'El contrato no ha sido impreso',hecho: true},
];
@Component({
  selector: 'app-pendientes',
  templateUrl: './pendientes.component.html',
  styleUrls: ['./pendientes.component.css']
})
export class PendientesComponent implements OnInit {

  constructor(private materiaService: MateriasService) { }


  public dataSourceDocentes: MatTableDataSource<Docente>;
  public dataSourcePendientes: MatTableDataSource<Pendiente>;
  displayedColumnsPendientes: string[]=['materia','id_docente','inicio','fin','message'];

  ngOnInit() {
    this.getDocentes();
    this.getPendientes();
  }


  @ViewChild('sortPendientes', {read: MatSort, static: false}) public sort2 : MatSort;
  @ViewChild('paginatorPendientes',{read:MatPaginator,static: false}) public paginator2: MatPaginator;

  private getDocentes(){
    this.materiaService.getDocentes().subscribe(
      res=>{
        if(res!=null){
          this.dataSourceDocentes = new MatTableDataSource(res);
        }
      },err=>{
        //console.log(err);
      }
    );
  }

  private getPendientes() {
    this.materiaService.getPendientes().subscribe(
      res=>{
        if(res!=null) {
          this.dataSourcePendientes = new MatTableDataSource(res);
          this.dataSourcePendientes.filteredData.map(a => a.id_docente = this.displayDocente(a.id_docente));
          this.dataSourcePendientes.sort = this.sort2;
          this.dataSourcePendientes.paginator = this.paginator2;
        }
      },err=>{
        //console.log(err);
      }
    );
  }

  displayDocente(docente) {
    if(this.dataSourceDocentes!=null){
      let docenteFilter = this.dataSourceDocentes.filteredData;
      let docenteAc = docenteFilter.find(res=>res._id==docente);
      if(docenteAc){
        if(docenteAc.segundo_nombre!=""){
          return docenteAc.nombre+" "+docenteAc.segundo_nombre+" "+docenteAc.apellido_paterno+" "+docenteAc.apellido_materno;
        }else{
          return docenteAc.nombre+" "+docenteAc.apellido_paterno+" "+docenteAc.apellido_materno;
        }
      }else{
        return "";
      }
    }
  }
  displayDate(inicio) {
    if(inicio!=null) {
      return inicio.substr(0, 10);
    }
  }

  applyFilterPendientes(filterValue: string) {
    this.dataSourcePendientes.filter = filterValue.trim().toLowerCase();
  }

  refresh() {
    this.getDocentes();
    this.getPendientes();
  }

  displayMensaje(message) {
    return message.toString();
  }
}
