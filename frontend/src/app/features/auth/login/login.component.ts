import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule
  ],
  template: `
    <div class="auth-container">
      <div class="tabs">
        <div class="tab active">Login</div>
        <div class="tab" (click)="goToRegister()" style="cursor: pointer;">Register</div>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onLogin()" #loginFormDir="ngForm">
        <!-- Display login error message -->
        <div class="error-alert" *ngIf="error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="username">Username *</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            formControlName="username"
            autocomplete="username">
          <div class="error-message" *ngIf="loginSubmitted && l['username'].errors">
            <small *ngIf="l['username'].errors?.['required']">Username is required</small>
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password *</label>
          <div class="password-input-container">
            <input 
              [type]="hidePassword ? 'password' : 'text'"
              id="password" 
              name="password" 
              formControlName="password"
              autocomplete="current-password">
            <mat-icon class="password-visibility-icon" (click)="togglePasswordVisibility()">
              {{hidePassword ? 'visibility_off' : 'visibility'}}
            </mat-icon>
          </div>
          <div class="error-message" *ngIf="loginSubmitted && l['password'].errors">
            <small *ngIf="l['password'].errors?.['required']">Password is required</small>
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label" for="rememberMe">
            <input 
              type="checkbox" 
              id="rememberMe" 
              name="rememberMe" 
              formControlName="rememberMe">
            <span>Remember me</span>
          </label>
        </div>

        <button type="submit" [disabled]="loading">Log In</button>

        <div class="forgot-password">
          <a href="#">Lost your password?</a>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  loginSubmitted = false;
  error = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Only clear auth state, don't navigate
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  get l() { return this.loginForm.controls; }

  async goToRegister() {
    console.log('Attempting to navigate to registration...');
    try {
      // Don't call logout() here since we just want to navigate
      await this.router.navigate(['/registration'], { replaceUrl: true });
      console.log('Navigation completed');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onLogin() {
    this.loginSubmitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    console.log('Login form value:', this.loginForm.value);
    this.loading = true;
    const { username, password } = this.loginForm.value;
    
    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        
        // If there's an error message in the response, show it
        if (response.message) {
          this.error = response.message;
          this.loading = false;
          return;
        }
        
        try {
          // Decode token manually
          const token = response.token;
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          console.log('Decoded token payload:', payload);
          
          // Get role from payload and convert to lowercase for case-insensitive comparison
          const userRole = (payload.role || '').toLowerCase();
          console.log('User role:', userRole);

          // Redirect based on role
          if (userRole === 'admin') {
            this.router.navigate(['/adminpage'], { replaceUrl: true });
          } else if (userRole === 'customer') {
            this.router.navigate(['/customer'], { replaceUrl: true });
          } else {
            this.router.navigate(['/home'], { replaceUrl: true });
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          this.error = 'Error processing login response';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        if (typeof error === 'string') {
          this.error = error;
        } else if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 401) {
          this.error = 'Invalid username or password';
        } else if (error.status === 403) {
          this.error = 'Access denied. You do not have permission to access this resource.';
        } else if (error.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = error.message || 'An unknown error occurred';
        }
        this.loading = false;
      }
    });
  }
} 