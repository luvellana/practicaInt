import {Component, OnInit} from '@angular/core';
import {SocialAuthService, SocialUser} from "angularx-social-login";
import {TokenService} from "./services/token.service";
import {Router} from "@angular/router";
import {AuthorizationService} from "./services/authorization.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{


  constructor(public authService: SocialAuthService, public tokenService: TokenService, private route: Router) {
  }


  signOut() {
    this.authService.signOut().catch(console.log);
    this.tokenService.reset();
    this.route.navigate(['']);
  }
}
