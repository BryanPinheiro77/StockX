import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router){}

  login(){
    this.authService.login(this.email, this.password)
    .then(() => this.router.navigate(['/dashboard']))
    .catch(err => this.error = 'Email ou senha inválidos');
  }
}
