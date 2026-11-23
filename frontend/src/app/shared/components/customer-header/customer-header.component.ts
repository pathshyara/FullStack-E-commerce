import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="logo">
        <img src="assets/logo.png" alt="AMEEN Market Logo" class="header-logo">
        <h1>AMEEN Market</h1>
      </div>
      <div class="header-right">
        <div class="nav-buttons">
          <a class="nav-button" [class.active]="isActive('/customer/dashboard')" [routerLink]="['/customer/dashboard']">
            <i class="bi bi-grid"></i> <span>Products</span>
          </a>
          <a class="nav-button cart-button" [class.active]="isActive('/customer/cart')" [class.cart-bounce]="cartAnimation" [routerLink]="['/customer/cart']">
            <i class="bi bi-cart"></i> <span>Cart</span>
            <span class="cart-count" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </a>
          <a class="nav-button" [class.active]="isActive('/customer/orders')" [routerLink]="['/customer/orders']">
            <i class="bi bi-box-seam"></i> <span>Orders</span>
          </a>
            <a class="nav-button" [class.active]="isActive('/customer/wishlist')" [routerLink]="['/customer/wishlist']">
            <i class="bi bi-heart"></i> <span>Wishlist</span>
          </a>
          <a class="nav-button" [class.active]="isActive('/customer/profile')" [routerLink]="['/customer/profile']">
            <i class="bi bi-person"></i> <span>Profile</span>
          </a>
          <button type="button" class="nav-button" (click)="onLogout($event)">
            <i class="bi bi-box-arrow-right"></i> <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    /* Shared Header Styles for Customer Pages */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-logo {
      width: 100px;
      height: auto;
      object-fit: contain;
    }

    .logo h1 {
      color: #2e7d32;
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    /* Navigation Links */
    .nav-buttons {
      display: flex;
      gap: 15px;
    }

    .nav-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 15px;
      background-color: #f5f5f5;
      color: #333;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
      gap: 8px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .nav-button:hover {
      background-color: #e0e0e0;
      transform: translateY(-2px);
      box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    }

    .nav-button.active {
      background-color: #2e7d32;
      color: white;
    }

    .nav-button.active:hover {
      background-color: #1b5e20;
    }

    .nav-button i {
      font-size: 1.1rem;
    }

    /* Cart Button Specific Styles */
    .cart-button {
      position: relative;
    }

    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #2e7d32;
      color: white;
      font-size: 0.7rem;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 600;
    }

    @keyframes cartBounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }

    .cart-bounce {
      animation: cartBounce 0.5s ease;
    }

    /* Media Queries for Responsive Design */
    @media (max-width: 768px) {
      .nav-buttons {
        gap: 8px;
      }
      
      .nav-button {
        padding: 8px 12px;
        font-size: 0.8rem;
      }
      
      .nav-button i {
        font-size: 1rem;
      }
    }

    @media (max-width: 576px) {
      .nav-button span {
        display: none;
      }
      
      .nav-button {
        padding: 8px;
      }
      
      .nav-buttons {
        gap: 5px;
      }
    }
  `]
})
export class CustomerHeaderComponent implements OnInit {
  @Input() cartCount: number = 0;
  @Input() cartAnimation: boolean = false;
  currentUrl: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Set initial active state based on current URL
    this.currentUrl = this.router.url;
    
    // Keep track of route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
    });
  }

  isActive(route: string): boolean {
    return this.currentUrl.includes(route);
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}