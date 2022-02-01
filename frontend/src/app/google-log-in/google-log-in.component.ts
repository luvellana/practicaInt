import { Component, OnInit } from '@angular/core';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { MateriasService } from '../services/materias.service';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../alert/alert.component';

@Component({
    selector: 'app-google-log-in',
    templateUrl: './google-log-in.component.html',
    styleUrls: ['./google-log-in.component.css']
})
export class GoogleLogInComponent implements OnInit {
    description = 'Sistema de Gestión de Procedimientos de Docentes';

    constructor(
        private route: Router,
        private authService: SocialAuthService,
        private tokenService: TokenService,
        private materiasService: MateriasService,
        public dialog: MatDialog
    ) {}
    ngOnInit(): void {
        
    }

    async signIn() {
        await this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
        this.authService.authState.subscribe(user => {
            //console.log('user', user);
            this.materiasService.getUsuarioByEmail(user.email).subscribe(
                res => {
                    this.tokenService.setUserDocFollow(res);
                    this.tokenService.setToken(user.idToken);
                    this.tokenService.setUser(user);
                    this.tokenService.setEmail(user.email);
                    this.route.navigate(['seguimiento']);
                },
                error => {
                    //console.log(error);
                    this.dialog.open(AlertComponent, {
                        width: '300px',
                        data: { action: 'Conflicto', message: 'Cuenta no registrada' }
                    });
                    this.authService.signOut().catch(console.log);
                    this.tokenService.reset();
                    this.route.navigate(['']);
                }
            );
        });
    }
}
