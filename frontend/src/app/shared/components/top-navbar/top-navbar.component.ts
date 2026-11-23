import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="top-navbar">
      <div class="logo-container">
        <img src="assets/logo.png" alt="Logo" class="logo">
        <a routerLink="/adminpage" class="brand">
          <span>Admin Panel</span>
        </a>
      </div>
      
      <div class="spacer"></div>
      
      <nav class="nav-links">
        <a routerLink="/adminpage" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <mat-icon>home</mat-icon>
          <span>Home</span>
        </a>
        <a routerLink="/adminpage/products" routerLinkActive="active" class="nav-link">
          <mat-icon>inventory_2</mat-icon>
          <span>Products</span>
        </a>
        <a routerLink="/adminpage/add-product" routerLinkActive="active" class="nav-link">
          <mat-icon>add_circle</mat-icon>
          <span>Add Product</span>
        </a>
        <a routerLink="/adminpage/categories" routerLinkActive="active" class="nav-link">
          <mat-icon>category</mat-icon>
          <span>Categories</span>
        </a>
        <a routerLink="/adminpage/orders" routerLinkActive="active" class="nav-link">
          <mat-icon>shopping_cart</mat-icon>
          <span>Orders</span>
        </a>
        <a [matMenuTriggerFor]="userMenu" class="nav-link account-link">
          <mat-icon>account_circle</mat-icon>
          <span>Account</span>
        </a>
      </nav>
      
      <button mat-icon-button class="mobile-menu-button" [matMenuTriggerFor]="mobileMenu">
        <mat-icon>menu</mat-icon>
      </button>
      
      <mat-menu #mobileMenu="matMenu" class="mobile-nav-menu">
        <a mat-menu-item routerLink="/adminpage">
          <mat-icon>home</mat-icon>
          <span>Home</span>
        </a>
        <a mat-menu-item routerLink="/adminpage/products">
          <mat-icon>inventory_2</mat-icon>
          <span>Products</span>
        </a>
        <a mat-menu-item routerLink="/adminpage/add-product">
          <mat-icon>add_circle</mat-icon>
          <span>Add Product</span>
        </a>
        <a mat-menu-item routerLink="/adminpage/categories">
          <mat-icon>category</mat-icon>
          <span>Categories</span>
        </a>
        <a mat-menu-item routerLink="/adminpage/orders">
          <mat-icon>shopping_cart</mat-icon>
          <span>Orders</span>
        </a>
        <mat-divider></mat-divider>
        <button mat-menu-item disabled *ngIf="isLoggedIn">
          <mat-icon>person</mat-icon>
          <span>{{ username }}</span>
        </button>
        <button mat-menu-item (click)="logout()" *ngIf="isLoggedIn">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </button>
        <button mat-menu-item routerLink="/login" *ngIf="!isLoggedIn">
          <mat-icon>login</mat-icon>
          <span>Login</span>
        </button>
      </mat-menu>
      
      <mat-menu #userMenu="matMenu" class="user-menu">
        <div class="user-menu-header" *ngIf="isLoggedIn">
          <mat-icon class="user-avatar">person</mat-icon>
          <span class="user-name">{{ username }}</span>
        </div>
        <mat-divider *ngIf="isLoggedIn"></mat-divider>
        <button mat-menu-item (click)="logout()" *ngIf="isLoggedIn">
          <mat-icon>exit_to_app</mat-icon>
          <span>Logout</span>
        </button>
        <button mat-menu-item routerLink="/login" *ngIf="!isLoggedIn">
          <mat-icon>login</mat-icon>
          <span>Login</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .top-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      height: 64px;
      padding: 0 24px;
      background: linear-gradient(135deg, #673ab7 0%, #9c27b0 100%);
      display: flex;
      align-items: center;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
    }
    
    .logo {
      height: 40px;
      width: 40px;
      margin-right: 12px;
      border-radius: 8px;
      background-color: white;
      padding: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    
    .logo:hover {
      transform: scale(1.05);
    }
    
    .brand {
      text-decoration: none;
      color: white;
      font-size: 1.4rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    
    .spacer {
      flex: 1;
    }
    
    .nav-links {
      display: flex;
      align-items: center;
    }
    
    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0 16px;
      height: 64px;
      display: flex;
      align-items: center;
      position: relative;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;
      opacity: 0.85;
    }
    
    .nav-link mat-icon {
      margin-right: 8px;
      transition: transform 0.2s ease;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      opacity: 1;
    }
    
    .nav-link:hover mat-icon {
      transform: translateY(-2px);
    }
    
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.15);
      border-bottom: 3px solid white;
      opacity: 1;
    }
    
    .account-link {
      border-radius: 20px;
      margin-left: 8px;
    }
    
    .mobile-menu-button {
      display: none;
    }
    
    .user-menu-header {
      padding: 16px;
      display: flex;
      align-items: center;
      background-color: #f5f5f5;
    }
    
    .user-avatar {
      background-color: #673ab7;
      color: white;
      border-radius: 50%;
      padding: 8px;
      margin-right: 8px;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 1rem;
    }
    
    @media (max-width: 900px) {
      .nav-links span {
        display: none;
      }
      
      .nav-link mat-icon {
        margin-right: 0;
      }
      
      .nav-link {
        padding: 0 12px;
      }
    }
    
    @media (max-width: 600px) {
      .top-navbar {
        padding: 0 16px;
      }
      
      .nav-links {
        display: none;
      }
      
      .mobile-menu-button {
        display: block;
      }
      
      .brand span {
        font-size: 1.2rem;
      }
    }
  `]
})
export class TopNavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.username = user?.username || '';
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 