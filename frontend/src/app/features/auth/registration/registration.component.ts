import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-registration',
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
        <div class="tab" (click)="goToLogin()" style="cursor: pointer;">Login</div>
        <div class="tab active">Register</div>
      </div>

      <form [formGroup]="registrationForm" (ngSubmit)="onRegister()" #registerFormDir="ngForm">
        <!-- Display register error message -->
        <div class="error-alert" *ngIf="error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="reg-username">Username *</label>
          <input 
            type="text" 
            id="reg-username" 
            name="username" 
            formControlName="username"
            autocomplete="username">
          <div class="error-message" *ngIf="registerSubmitted && f['username'].errors">
            <small *ngIf="f['username'].errors?.['required']">Username is required</small>
            <small *ngIf="f['username'].errors?.['minlength']">Username must be at least 3 characters</small>
          </div>
        </div>

        <div class="form-group">
          <label for="reg-email">Email *</label>
          <input 
            type="email" 
            id="reg-email" 
            name="email" 
            formControlName="email"
            autocomplete="email">
          <div class="error-message" *ngIf="registerSubmitted && f['email'].errors">
            <small *ngIf="f['email'].errors?.['required']">Email is required</small>
            <small *ngIf="f['email'].errors?.['email']">Email must be valid</small>
          </div>
        </div>

        <div class="form-group">
          <label for="reg-password">Password *</label>
          <div class="password-input-container">
            <input 
              [type]="hidePassword ? 'password' : 'text'"
              id="reg-password" 
              name="password" 
              formControlName="password"
              autocomplete="new-password">
            <mat-icon class="password-visibility-icon" (click)="togglePasswordVisibility()">
              {{hidePassword ? 'visibility_off' : 'visibility'}}
            </mat-icon>
          </div>
          <div class="error-message" *ngIf="registerSubmitted && f['password'].errors">
            <small *ngIf="f['password'].errors?.['required']">Password is required</small>
            <small *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters</small>
            <small *ngIf="f['password'].errors?.['pattern']">Password must contain at least one uppercase letter, one lowercase letter, and one number</small>
          </div>
        </div>

        <div class="form-group">
          <label for="reg-role">Role</label>
          <select 
            id="reg-role" 
            name="role" 
            formControlName="role">
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" [disabled]="loading">Register</button>
      </form>
    </div>
  `,
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  loading = false;
  registerSubmitted = false;
  error = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
      ]],
      role: ['customer']
    });
  }

  ngOnInit() {
    // Only clear auth state, don't navigate
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  get f() { return this.registrationForm.controls; }

  async goToLogin() {
    console.log('Attempting to navigate to login...');
    try {
      // Don't call logout() here since we just want to navigate
      await this.router.navigate(['/login'], { replaceUrl: true });
      console.log('Navigation completed');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onRegister() {
    this.registerSubmitted = true;
    this.error = '';

    if (this.registrationForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register(this.registrationForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (error) => {
        console.error('Registration error:', error);
        if (typeof error === 'string') {
          this.error = error;
        } else if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 400) {
          this.error = 'Invalid registration data. Please check your inputs.';
        } else if (error.status === 409) {
          this.error = 'Username or email already exists.';
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