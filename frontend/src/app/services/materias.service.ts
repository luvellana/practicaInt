import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http'
import {Materia} from '../models/materia'
import {Docente} from '../models/docente'
import {Observable} from "rxjs";
import {TokenService} from "./token.service";
import {Usuario} from "../models/usuario";

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  //readonly URL_API = "https://186.121.251.3:7910";
  readonly URL_API = "http://localhost:3700";

  constructor(private http: HttpClient, private tokenService: TokenService) {
  }

  getDocentesAnyWay():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    return this.http.get(this.URL_API+"/docentes/getAll/",{headers:headers});
  }
  postMateriasExcel(excel){
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    return this.http.post(this.URL_API+"/materias/create/excel",{excel},{headers:headers, observe: "response"})
  }

  getUsuarios():Observable<any>{
    return this.http.get(this.URL_API+"/usuarios/getAll",{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken())
    });

  }
  deleteUsuarios(idUsuario){
    return this.http.delete<HttpResponse<Usuario>>(this.URL_API+"/usuarios/delete/"+idUsuario,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }
  postUsuarios(usuario){
    let params = JSON.stringify(usuario);
    return this.http.post<HttpResponse<Usuario>>(this.URL_API+"/usuarios/create",params,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }
  putUsuarios(usuario,idUsuario){
    let params = JSON.stringify(usuario);
    return this.http.put<HttpResponse<Usuario>>(this.URL_API+"/usuarios/update/"+idUsuario,params,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
        observe:"response"
    });
  }

  getUsuarioByEmail(email: string):Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', "application/json");
    return this.http.get(this.URL_API+"/usuarios/getOneByEmail/"+email,{headers:headers});
  }

  getDocentes():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    if(this.tokenService.getUsuarioDocFollow() && this.tokenService.getUsuarioDocFollow().rol=="jefe_carrera"){
      return this.http.get(this.URL_API+"/docentes/getByUserId/"+this.tokenService.getUsuarioDocFollow().nombre_corto,{headers:headers});
    }else{
      return this.http.get(this.URL_API+"/docentes/getAll/",{headers:headers});
    }
  }

  getMaterias(anio?,semestre?):Observable<any>{
    let newParam:string = '';
    if(anio && semestre){
      newParam += anio.toString()+"/"+semestre.toString();
    }
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    if(this.tokenService.getUsuarioDocFollow() && this.tokenService.getUsuarioDocFollow().rol=="jefe_carrera"){
      return this.http.get(this.URL_API+"/materias/getByUserId/"+this.tokenService.getUsuarioDocFollow().nombre_corto+"/"+newParam,{headers:headers});
    }else{
      return this.http.get(this.URL_API+"/materias/getAll/"+newParam,{headers:headers});
    }
  }

  postDocente(docente){
    let params = JSON.stringify(docente);
    return this.http.post(this.URL_API + "/docentes/create",params,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }

  putDocente(docenteID, body){
    return this.http.put(this.URL_API + "/docentes/update"+`/${docenteID}`,body,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }

  deleteDocente(docente: Docente){
    return this.http.delete(this.URL_API + "/docentes/delete"+`/${docente._id}`,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }



  postMateria(materia){
    let params = JSON.stringify(materia);
    return this.http.post(this.URL_API+ "/materias/create",params,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }

  putMateria(materiaId,body,docenteAntiguo?){
    let newParam: string;
    if(docenteAntiguo){
      newParam = "/"+docenteAntiguo
    }else{
      newParam = "";
    }
    return this.http.put(this.URL_API+"/materias/update"+`/${materiaId}`+newParam, body,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }

  deleteMateria(materia: Materia,idDocAn?){
    let newParam:string;
    if(!idDocAn){
      newParam = "";
    }else{
      newParam = idDocAn
    }
    return this.http.delete(this.URL_API+"/materias/delete"+`/${materia._id}`+newParam,{
      headers:new HttpHeaders()
        .set('Content-Type', "application/json")
        .set('Token', this.tokenService.getToken()),
      observe:"response"
    });
  }

  getPendientes():Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    if(this.tokenService.getUsuarioDocFollow()){
      return this.http.get(this.URL_API + "/pendientes/"+this.tokenService.getUsuarioDocFollow()._id,{headers:headers});
    }else{
      return this.http.get(this.URL_API + "/pendientes/",{headers:headers});
    }
  }

  sendMail(body){
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    return this.http.post(this.URL_API+'/sendMail',body,{headers:headers});
  }

  resetAnio() {
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    return this.http.post(this.URL_API+"/reset/eval_pares",{headers: headers});
  }

  resetSemestre() {
    console.log(this.tokenService.getToken());
    let headers = new HttpHeaders().set('Content-Type', "application/json")
      .set('Token', this.tokenService.getToken());
    return this.http.post(this.URL_API+"/reset/semestre",{headers: headers});
  }
}
