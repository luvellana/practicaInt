import { Injectable } from '@angular/core';
import {SocialUser} from "angularx-social-login";
import {Usuario} from "../models/usuario";

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  user: SocialUser;
  userDocFollow:Usuario;
  token : string;
  email: string;

  constructor() { }

  getToken(){
    return this.token;
  }
  setToken(token:string){
    this.token=token;
  }

  setUser(user: SocialUser){
    this.user=user;
  }
  getUser(){
    return this.user;
  }
  setEmail(email){
    this.email=email;
  }
  getEmail(){
    return this.email
  }

  setUserDocFollow(usuario: Usuario) {
    this.userDocFollow = usuario
  }
  getUsuarioDocFollow(){
    if(this.userDocFollow){
      return this.userDocFollow;
    }else{
      return null
    }

  }

  reset(){
    this.setUser(null);
    this.setToken(null);
    this.setEmail(null);
    this.setUserDocFollow(null);
  }


}
