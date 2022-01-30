import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MateriasService} from "../services/materias.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {AddMateriaComponent} from "../add-materia/add-materia.component";
import {AddDocenteComponent} from "../add-docente/add-docente.component";
import {MatSort} from '@angular/material/sort';
import {Docente} from "../models/docente";
import {Materia} from "../models/materia";
import {MatPaginator} from "@angular/material/paginator";
import {EditMateriaComponent} from "../edit-materia/edit-materia.component";
import {EditDocenteComponent} from "../edit-docente/edit-docente.component";
import {TokenService} from "../services/token.service";
import {Router} from "@angular/router";
import {Usuario} from "../models/usuario";
import {AddUsuarioComponent} from "../add-usuario/add-usuario.component";
import {EditUsuarioComponent} from "../edit-usuario/edit-usuario.component";
import {DeleteComponent} from "../delete/delete.component";
import {AlertComponent} from "../alert/alert.component";

export class Configuracion {
  constructor(){
  }
}

@Component({
  selector: 'app-pending',
  templateUrl: './jefe-de-carrera.component.html',
  styleUrls: ['./jefe-de-carrera.component.css']
})
export class JefeDeCarreraComponent implements OnInit {

  public usuarioDoc: Usuario;
  public admin: boolean;
  public decano: boolean;
  public jefe: boolean;
  public asistente: boolean;
  public registros: boolean;
  public contabilidad: boolean;

  public dataSourceConfiguracion: MatTableDataSource<Configuracion>;
  public dataSourceConfiguracionMaterias: MatTableDataSource<Configuracion>;
  public dataSourceConfiguracionDocentes: MatTableDataSource<Configuracion>;
  public dataSourceConfiguarionPendientes: MatTableDataSource<Configuracion>;


  public dataSourceMaterias: MatTableDataSource<Materia>;
  public dataSourceMaterias2: MatTableDataSource<Materia>;
  public dataSourceMaterias3: MatTableDataSource<Materia>;
  public dataSourceDocentes: MatTableDataSource<Docente>;
  public dataSourceDocentes2:MatTableDataSource<Docente>;
  public dataSourceUsuarios: MatTableDataSource<Usuario>;

  displayedColumnsConfiguracion: string[]=['opcion','configuracion'];
  displayedColumnsUsuarios: string[]=['nombre','email','rol','opciones'];

  formPeriodo = new FormGroup({
    anio: new FormControl('',Validators.required),
    semestre: new FormControl('',Validators.required),
  });

  constructor(private route: Router,
              private materiaService: MateriasService,
              public dialogMaterias: MatDialog,
              private tokenService: TokenService) {
  }

  ngOnInit() {
    this.verifyUsuarioDoc().catch(()=>{
      this.route.navigate(['']);
    });
    this.setRoles().catch(()=>{
      this.route.navigate(['']);
    });
    this.setPreferences().catch(()=>{
      this.route.navigate(['']);
    });
    this.setConfigurationTables().catch(()=>{
      this.route.navigate(['']);
    });
    this.getDocentes();
    this.getDocentes2();
    this.getMaterias();
    this.getMaterias2();
    this.getUsuarios();
  }
  async verifyUsuarioDoc(){
    this.usuarioDoc = await this.tokenService.getUsuarioDocFollow();
    if (!this.usuarioDoc) {
      await this.route.navigate(['']);
    }
    //console.log(this.tokenService.getToken());
  }

  async setRoles(){
    this.admin = this.tokenService.getUsuarioDocFollow().super_usuario;
    this.decano = this.tokenService.getUsuarioDocFollow().rol =="decano";
    this.jefe = this.tokenService.getUsuarioDocFollow().rol=="jefe_carrera";
    this.asistente = this.tokenService.getUsuarioDocFollow().rol=="asistente";
    this.registros = this.tokenService.getUsuarioDocFollow().rol=="registros";
    this.contabilidad = this.tokenService.getUsuarioDocFollow().rol=="contabilidad";

    this.displayedColumnsMaterias.filter(a=>(a.def=='horas_planta' || a.def=='horas_totales')).map(a=>a.hide=(this.jefe||this.asistente));
    this.displayedColumnsMaterias.filter(a=>(a.def=='silabo_subido'||a.def=='aula_revisada' || a.def=='examen_revisado')).map(a=>a.hide=(this.jefe));
    this.displayedColumnsMaterias.filter(a=>(a.def=='contrato_impreso'||a.def=='contrato_firmado')).map(a=>a.hide=(this.asistente));
    this.displayedColumnsMaterias.filter(a=>a.def=='planilla_lista').map(a=>a.hide=(this.registros));
    this.displayedColumnsMaterias.filter(a=>a.def=='planilla_firmada').map(a=>a.hide=(this.registros/*|| this.contabilidad*/));
    this.displayedColumnsMaterias.filter(a=>(/*a.def=='cheque_solicitado'||*/a.def=='cheque_recibido')).map(a=>a.hide=(this.contabilidad));
    this.displayedColumnsMaterias.filter(a=>a.def=='opciones').map(a=>a.hide=(this.admin||this.jefe||this.asistente));

    this.displayedColumnsPendientes.filter(a=>(a.def=="ver_evaluacion_pares"||a.def=="ver_horas_no_asignadas")).map(a=>a.hide=(this.jefe));
    this.displayedColumnsPendientes.filter(a=>(a.def=="ver_evaluacion_pares"||a.def=="ver_horas_no_asignadas")).map(a=>a.rol=(this.jefe));

    this.displayedColumnsMaterias.filter(a=>(a.def=='horas_planta' || a.def=='horas_totales')).map(a=>a.rol=(this.jefe||this.asistente));
    this.displayedColumnsMaterias.filter(a=>(a.def=='silabo_subido'||a.def=='aula_revisada' || a.def=='examen_revisado')).map(a=>a.rol=(this.jefe));
    this.displayedColumnsMaterias.filter(a=>(a.def=='contrato_impreso'||a.def=='contrato_firmado')).map(a=>a.rol=(this.asistente));
    this.displayedColumnsMaterias.filter(a=>a.def=='planilla_lista').map(a=>a.rol=(this.registros));
    this.displayedColumnsMaterias.filter(a=>a.def=='planilla_firmada').map(a=>a.rol=(this.registros/*|| this.contabilidad*/));
    this.displayedColumnsMaterias.filter(a=>(/*a.def=='cheque_solicitado'||*/a.def=='cheque_recibido')).map(a=>a.rol=(this.contabilidad));
    this.displayedColumnsMaterias.filter(a=>a.def=='opciones').map(a=>a.rol=(this.admin||this.jefe||this.asistente));

  }

  async setPreferences(){
    let user = this.tokenService.getUsuarioDocFollow();
    let prefMat = user.preferencias;
    if(user.rol=="jefe_carrera"){
      //seguimiento
      this.setPreferenciasSeguimiento(user);
      //materias
      this.displayedColumnsMaterias[4].hide=prefMat.horas_planta;
      this.displayedColumnsMaterias[5].hide=prefMat.horas_totales;
      this.displayedColumnsMaterias[6].hide=prefMat.silabo_subido;
      this.displayedColumnsMaterias[7].hide=prefMat.aula_revisada;
      this.displayedColumnsMaterias[8].hide=prefMat.examen_revisado;
    }else if(user.rol=="asistente"){
      this.displayedColumnsMaterias[9].hide=prefMat.contrato_impreso;
      this.displayedColumnsMaterias[10].hide=prefMat.contrato_firmado;
    }else if(user.rol=="registros"){
      this.displayedColumnsMaterias[11].hide=prefMat.planilla_lista;
      this.displayedColumnsMaterias[12].hide=prefMat.planilla_firmada;
    }else if(user.rol=="contabilidad"){
      //this.displayedColumnsMaterias[12].hide=prefMat.planilla_firmada;
      //this.displayedColumnsMaterias[13].hide=prefMat.cheque_solicitado;
      this.displayedColumnsMaterias[13].hide=prefMat.cheque_recibido;
    }else if(user.rol=="decano"){
      //seguimiento
      this.setPreferenciasSeguimiento(user);
    }
    if(user.rol!="decano"){
      this.displayedColumnsPendientes[0].hide=user.ver_pendientes_pasadas;
      this.displayedColumnsPendientes[1].hide=user.ver_evaluacion_pares;
      this.displayedColumnsPendientes[2].hide=user.ver_horas_no_asignadas;
    }
  }

  async setConfigurationTables(){
    this.dataSourceConfiguracion =  new MatTableDataSource(this.neededColumnDefinitions());
    this.dataSourceConfiguracionMaterias =  new MatTableDataSource(this.neededColumnDefinitionsMaterias());
    this.dataSourceConfiguracionDocentes = new MatTableDataSource(this.neededColumnDefinitionsDocentes());
    this.dataSourceConfiguarionPendientes = new MatTableDataSource(this.neededColumDefinitionsExtras());
  }

  setPreferenciasSeguimiento(user: Usuario){
    let prefSeg = user.preferencias_seguimiento;
    let i = 4;
    for(let value of Object.values(prefSeg)){
      if(value == false || value == true){
        this.columnDefinitions[i].hide=value;
        i++;
      }
      if(i == 13){
        break;
      }
    }
  }

  @ViewChild('sortGeneral', {read: MatSort, static: false}) public sort1 : MatSort;
  @ViewChild('sortDocentes', {read: MatSort, static: false}) public sort2 : MatSort;
  @ViewChild('sortMaterias', {read: MatSort, static: false}) public sort3 : MatSort;
  @ViewChild('sortUsuarios', {read: MatSort, static: false}) public sort4 : MatSort;

  @ViewChild('paginatorDocentes',{read:MatPaginator,static: false}) public paginator2: MatPaginator;
  @ViewChild('paginatorMaterias',{read:MatPaginator,static: false}) public paginator3: MatPaginator;
  @ViewChild('paginatorGeneral',{read:MatPaginator,static: false}) public paginator1: MatPaginator;
  @ViewChild('paginatorUsuarios',{read:MatPaginator,static: false}) public paginator4: MatPaginator;

  displayedColumnsPendientes =
    [
      {def: "ver_pendientes_pasadas", label: "Pendientes pasados", hide: true,rol:true},
      {def: "ver_evaluacion_pares", label: "Evaluacion por pares", hide: true,rol:true},
      {def: "ver_horas_no_asignadas", label: "Asignar horas a docentes", hide: true,rol:true}
    ];

  columnDefinitions =
    [{def: 'nombre', label: 'Materia', hide: true},
      {def: 'id_docente', label: 'Docente', hide: true},
      {def: 'inicio', label: 'Inicio', hide: true},
      {def: 'fin', label: 'Fin', hide: true},
      {def: 'silabo_subido', label: 'Silabo Subido', hide: true},
      {def: 'aula_revisada', label: 'Aula Revisada', hide: true},
      {def: 'examen_revisado', label: 'Examen Revisado', hide: true},
      {def: 'contrato_impreso', label: 'Contrato Impreso', hide: true},
      {def: 'contrato_firmado', label: 'Contrato Firmado', hide: true},
      {def: 'planilla_lista', label: 'Planilla Lista', hide: true},
      {def: 'planilla_firmada', label: 'Planilla Firmada', hide: true},
      //{def: 'cheque_solicitado', label: 'Pago Solicitado', hide: true},
      {def: 'cheque_recibido', label: 'Pago Realizado', hide: true},
      {def: 'opciones',label: 'Opciones',hide: true}
    ];

  displayedColumnsMaterias =
    [{def: 'nombre', label: 'Materia', hide: true},
      {def: 'id_docente', label: 'Docente', hide: true},
      {def: 'inicio', label: 'Inicio', hide: true},
      {def: 'fin', label: 'Fin', hide: true},
      {def : 'horas_planta', label: 'Horas de Planta',hide: true,rol: true},
      {def: 'horas_totales', label: 'Horas Totales', hide:true,rol: true},
      {def: 'silabo_subido', label: 'Silabo Subido', hide:true,rol: true},
      {def: 'aula_revisada', label: 'Aula Revisada', hide: true,rol: true},
      {def: 'examen_revisado', label: 'Examen Revisado', hide:true,rol: true},
      {def: 'contrato_impreso', label: 'Contrato Impreso', hide:true,rol: true},
      {def: 'contrato_firmado', label: 'Contrato Firmado', hide: true,rol: true},
      {def: 'planilla_lista', label: 'Planilla Lista', hide: true,rol: true},
      {def: 'planilla_firmada', label: 'Planilla Firmada', hide: true,rol: true},
      //{def: 'cheque_solicitado', label: 'Pago Solicitado', hide: true,rol: true},
      {def: 'cheque_recibido', label: 'Pago Realizado', hide:true,rol: true},
      {def: 'opciones',label: 'Opciones',hide: true}
    ];

  displayedColumnsDocentes =
    [{def: 'nombre', label: 'Docente', hide: true},
      {def: 'materias_asignadas',label: 'Materia Asignadas',hide: true},
      {def:'horas_planta',label: 'Horas de Planta',hide: true},
      {def:'horas_cubiertas',label: 'Horas Cubiertas',hide: true},
      {def:'horas_faltantes',label: 'Horas Faltantes',hide: true},
      {def:'evaluacion_pares',label: 'Evaluacion por Pares',hide: true},
      {def: 'opciones',label: 'Opciones',hide: true}
    ];

  private getMaterias(anio?,semestre?){
    this.materiaService.getMaterias(anio,semestre).subscribe(
      res => {
        this.dataSourceMaterias = new MatTableDataSource(res);
        this.dataSourceMaterias.sort = this.sort1;
        this.dataSourceMaterias.paginator = this.paginator1;
        this.dataSourceMaterias2 = new MatTableDataSource(res);
        this.dataSourceMaterias2.filteredData.map(a=>a.id_docente=this.displayDocente2(a.id_docente));
        this.dataSourceMaterias2.sort = this.sort3;
        this.dataSourceMaterias2.paginator = this.paginator3;
      }, err => {
        //console.log(err);
      }
    );
  }
  private getMaterias2(anio?,semestre?){
    this.materiaService.getMaterias(anio,semestre).subscribe(
    res=>{
      this.dataSourceMaterias3 = new MatTableDataSource(res);
    }, err => {
      //console.log(err);
    }
    )
  }
  private getDocentes2() {
    this.materiaService.getDocentesAnyWay().subscribe(
      res=>{
        this.dataSourceDocentes2 = new MatTableDataSource(res);
      },err=>{
        //console.log(err);
      }
    );
  }

  private getDocentes(){
    this.materiaService.getDocentes().subscribe(
      res=>{
        this.dataSourceDocentes = new MatTableDataSource(res);
        this.dataSourceDocentes.sort = this.sort2;
        this.dataSourceDocentes.paginator = this.paginator2;
      },err=>{
        //console.log(err);
      }
    );
  }
  private getUsuarios(){
    this.materiaService.getUsuarios().subscribe(
      res=>{
        this.dataSourceUsuarios = new MatTableDataSource(res);
        this.dataSourceUsuarios.sort = this.sort4;
        this.dataSourceUsuarios.paginator = this.paginator4;
      },err=>{
        //console.log(err);
      }
    );
  }

  openAddMaterias() {
    let dialogRef = this.dialogMaterias.open(AddMateriaComponent, {width:'750px', height:'600px'});
    dialogRef.afterClosed().subscribe(() => {
      this.getDocentes();
      this.getMaterias();
      this.getMaterias2();
    });
  }

  openAddDocentes() {
    let dialogRef = this.dialogMaterias.open(AddDocenteComponent, {width:'750px'});
    dialogRef.afterClosed().subscribe(() => {
      this.getDocentes();
      this.getMaterias();
      this.getMaterias2();
    });
  }

  neededColumnDefinitions(){
    return this.columnDefinitions.filter(res=>(res.label!='Opciones'&&res.label != "Materia" && res.label != "Docente" && res.label != "Inicio" && res.label != "Fin"));
  }

  neededColumnDefinitionsMaterias(){
    return this.displayedColumnsMaterias.filter(res=>(res.label!='Opciones'&&res.rol!=false && res.label != "Materia" && res.label != "Docente" && res.label != "Inicio" && res.label != "Fin"));
  }

  neededColumnDefinitionsDocentes(){
    return this.displayedColumnsDocentes.filter(res=>(res.label!='Opciones' && res.label != "Docente"));
  }

  neededColumDefinitionsExtras(){
    return this.displayedColumnsPendientes.filter(res=>res.rol!=false);
  }

  getDisplayedColumns():string[] {

    return this.columnDefinitions.filter(cd=>cd.hide).map(cd=>cd.def);
  }

  getDisplayedColumnsMaterias():string[] {

    return this.displayedColumnsMaterias.filter(cd=>cd.hide).map(cd=>cd.def);
  }

  getDisplayedColumnsDocentes(): string[]{

    return this.displayedColumnsDocentes.filter(cd=>cd.hide).map(cd=>cd.def);
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
  displayDocente2(docente) {
    if(this.dataSourceDocentes2!=null){
      let docenteFilter = this.dataSourceDocentes2.filteredData;
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

  applyFilterMaterias(filterValue: string) {
    this.dataSourceMaterias.filter = filterValue.trim().toLowerCase();
  }
  applyFilterMaterias2(filterValue: string) {
    this.dataSourceMaterias2.filter = filterValue.trim().toLowerCase();
  }

  applyFilterDocentes(filterValue: string) {
    this.dataSourceDocentes.filter = filterValue.trim().toLowerCase();
  }
  applyFilterUsuarios(filterValue: string) {
    this.dataSourceUsuarios.filter = filterValue.trim().toLowerCase();
  }

  setCheckbox(idMateria,body,materia?) {
    let idDocente = this.dataSourceMaterias3.filteredData.filter(a=>a._id==idMateria).map(a=>a.id_docente);
    let docente = this.dataSourceDocentes.filteredData.filter(a=>a._id==idDocente[0]);
    //console.log('docente', docente)
    if(docente.length > 0){
      if(body.contrato_impreso){
        this.dialogMaterias.open(DeleteComponent, {width:'300px',data:{materia:materia,docente:docente,asunto:"firmar_contrato",element:null}});
      }else if(body.planilla_lista){
        this.dialogMaterias.open(DeleteComponent, {width:'300px',data:{materia:materia,docente:docente,asunto:"firmar_planilla",element:null}});
      }else if(body.cheque_recibido){
        this.dialogMaterias.open(DeleteComponent, {width:'300px',data:{materia:materia,docente:docente,asunto:"recoger_cheque",element:null}});
      }
      if(this.tokenService.getUsuarioDocFollow().rol!="decano"){
        this.materiaService.putMateria(idMateria,body).subscribe(
          res=>{
            console.log(res);
            this.getMaterias();
          },
          error => {
            console.log(error);
          }
        )
      }
    }else{

      this.getMaterias();
      this.dialogMaterias.open(AlertComponent, {width:'300px',data:{action:"Error",message:`No se asignó a un docente a esta materia. Por favor, comunique al Jefe de Carrera correspondiente.`}});
          
    }

  }

  setEvalPares(idDocente,body) {
    if(this.tokenService.getUsuarioDocFollow().rol=="jefe_carrera"){
      this.materiaService.putDocente(idDocente,body).subscribe(
        res=>{
          console.log(res);
        },
        error => {
          console.log(error);
        }
      );
    }

  }

  editMateria(element: Materia, view?: boolean) {
    let idMateria = element._id;
    let idDocente = this.dataSourceMaterias3.filteredData.filter(a=>a._id == idMateria).map(a=>a.id_docente);
    let docente = this.dataSourceDocentes2.filteredData.filter(a=>a._id == idDocente as unknown as string);
    let idJefe = this.dataSourceMaterias3.filteredData.filter(a=>a._id ==idMateria).map(a=>a.id_jefe_carrera);
    let jefe = this.dataSourceUsuarios.filteredData.filter(a=>a._id==idJefe as unknown as string);
    let dialogRef = this.dialogMaterias.open(EditMateriaComponent, {width:'750px',data:{materia: element,docente:docente,jefe:jefe,visual:view}});
    dialogRef.afterClosed().subscribe(() => {
      this.getDocentes();
      this.getMaterias();
      this.getMaterias2();
    });
  }

  editDocente(element: Docente, view? :boolean) {
    let idDocente = element._id;
    let idJefe = this.dataSourceDocentes.filteredData.filter(a=>a._id ==idDocente).map(a=>a.id_jefe_carrera);
    let jefe = this.dataSourceUsuarios.filteredData.filter(a=>a._id==idJefe as unknown as string);
    let dialogRef = this.dialogMaterias.open(EditDocenteComponent, {width:'750px',data:{docente:element,visual:view,jefe:jefe}});
    dialogRef.afterClosed().subscribe(()=>{
      this.getDocentes();
      this.getMaterias();
      this.getMaterias2();
    })
  }

  deleteMateria(element: Materia) {
    let idDocenteAc = this.dataSourceMaterias3.filteredData.filter(a=>a._id == element._id).map(a=>a.id_docente);
    let dialogRef = this.dialogMaterias.open(DeleteComponent, {width:'300px',data:{docenteAc:idDocenteAc,element:element,def:"materia",docente:null}});
    dialogRef.afterClosed().subscribe(()=> {
      this.getDocentes();
      this.getMaterias();
      this.getMaterias2();
    })
  }

  deleteDocente(element: Docente) {
    let dialogRef = this.dialogMaterias.open(DeleteComponent, {width:'300px',data:{element:element,def:"docente",docente:null}});
    dialogRef.afterClosed().subscribe(()=> {
          this.getDocentes();
          this.getMaterias();
          this.getMaterias2();
    })
  }

  openAddCuentas() {
    let dialogRef = this.dialogMaterias.open(AddUsuarioComponent, {width:'750px'});
    dialogRef.afterClosed().subscribe(() => {
      this.getUsuarios();
    });
  }

  editUsuario(element, view?: boolean) {
    let dialogRef = this.dialogMaterias.open(EditUsuarioComponent, {width:'750px',data:{usuario:element,view:view}});
    dialogRef.afterClosed().subscribe(()=>{
      this.getUsuarios();
    });
  }

  deleteUsuario(element: Usuario) {
    let dialogRef = this.dialogMaterias.open(DeleteComponent, {width:'300px',data:{element:element,def:"usuario"}});
    dialogRef.afterClosed().subscribe(()=> {
      this.getUsuarios();
    })
  }

  refresh() {
    this.getUsuarios();
    this.getDocentes();
    this.getMaterias();
    this.getMaterias2();
  }

  displayRol(rol) {
    if(rol == "jefe_carrera"){
      return "Jefe de Carrera"
    }else if(rol == "asistente"){
      return "Asistente Administrativa"
    }else if(rol == "registros"){
      return "Encargada de Registros"
    }else if(rol == "contabilidad"){
      return "Encargada de Contabilidad"
    }else if(rol == "decano"){
      return "Decano"
    }
  }

  async  updatePreferences() {
    await this.materiaService.getUsuarioByEmail(this.tokenService.getUsuarioDocFollow().email).subscribe(
      res=>{
        this.tokenService.setUserDocFollow(res);
        this.setPreferences();
      },error=>{
        console.log(error)
      }
    );
  }

  changePreferenceSeg(def,hide) {
    let negation = !(hide);
    let body = this.tokenService.getUsuarioDocFollow().preferencias_seguimiento;
    body[def.toString()] = negation;
    //console.log(body);
    this.materiaService.putUsuarios({"preferencias_seguimiento": body}, this.tokenService.userDocFollow._id).subscribe(
      res => {
        console.log(res);
        this.updatePreferences();
      },error => {
        console.log(error);
      }
    );
  }
  changePreferenceMat(def,hide) {
    let negation = !(hide);
    let body = this.tokenService.getUsuarioDocFollow().preferencias;
    body[def.toString()] = negation;
    //console.log(body);
    this.materiaService.putUsuarios({"preferencias": body}, this.tokenService.userDocFollow._id).subscribe(
      res => {
        console.log(res);
        this.updatePreferences();
      },error => {
        console.log(error);
      }
    );
  }

  changePreferenceOld(def,hide) {
    let negation = !(hide);
    let body = {};
    if(def.toString()=="ver_pendientes_pasadas"){
      body = {"ver_pendientes_pasadas": negation}
    }else if(def.toString()=="ver_evaluacion_pares"){
      body = {"ver_evaluacion_pares": negation}
    }else if(def.toString()=="ver_horas_no_asignadas"){
      body = {"ver_horas_no_asignadas": negation}
    }
    console.log(body);
    this.materiaService.putUsuarios(body, this.tokenService.userDocFollow._id).subscribe(
      res => {
        console.log(res);
        this.updatePreferences();
      },error => {
        console.log(error);
      }
    );
  }

  setCheckboxEsp(idMateria,body) {
    if(this.tokenService.getUsuarioDocFollow().rol=="registros"){
      this.materiaService.putMateria(idMateria,body).subscribe(
        res=>{
          console.log(res);
          this.getMaterias();
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  buscarMateriasPeriodo() {
    if(this.formPeriodo.valid){
      this.getMaterias(this.formPeriodo.value.anio.toString(),this.formPeriodo.value.semestre.toString());
      this.getMaterias2(this.formPeriodo.value.anio.toString(),this.formPeriodo.value.semestre.toString());
    }
  }


  resetAnio() {
    this.materiaService.resetAnio().subscribe(
      res=>{
        console.log(res);
      },error =>{
        console.log(error);
      }
    )
  }

  resetSemestre() {
    this.materiaService.resetSemestre().subscribe(
      res=>{
        console.log(res);
      },error=>{
        console.log(error);
      }
    )
  }
}
