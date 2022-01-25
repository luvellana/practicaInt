import { Injectable } from '@angular/core';
import {SocialAuthService, GoogleLoginProvider, SocialUser} from "angularx-social-login";
import {TokenService} from "./token.service";
import {MateriasService} from "./materias.service";

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  constructor(public authService: SocialAuthService, public tokenService: TokenService, public materiasService: MateriasService) {

  }

  signIn(){
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).catch(console.log);
    this.authService.authState.subscribe(user => {
      this.materiasService.getUsuarioByEmail(user.email).subscribe(
        res => {
          this.tokenService.setUserDocFollow(res);
          this.tokenService.setToken(user.idToken);
          this.tokenService.setUser(user);
          this.tokenService.setEmail(user.email);
        },error=>{
          confirm('Cuenta no registrada');
          this.signOut();
        }
      );

    });
  }

  async signOut() {
    console.log('service log out');
    await this.authService.signOut();
    this.tokenService.reset();
  }

}
