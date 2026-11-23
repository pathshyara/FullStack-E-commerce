import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistrationComponent } from './features/auth/registration/registration.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'adminpage', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent), 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'admin' } 
  },
  { 
    path: 'adminpage/products', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent), 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'admin' } 
  },
  { 
    path: 'adminpage/add-product', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent), 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'admin' } 
  },
  { 
    path: 'adminpage/categories', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent), 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'admin' } 
  },
  { 
    path: 'adminpage/orders', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent), 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'admin' } 
  },
  // Customer routes
  { 
    path: 'customer', 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'customer' }, 
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
      { path: 'cart', loadComponent: () => import('./features/shopping-cart/shopping-cart.component').then(m => m.ShoppingCartComponent) },
      { path: 'orders', loadComponent: () => import('./features/my-order/my-order.component').then(m => m.MyOrderComponent) },
      { path: 'order-success', loadComponent: () => import('./features/order-success/order-success').then(m => m.OrderSuccess) },
      { path: 'wishlist', loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Additional routes - these are redirects to the customer routes for compatibility
  { path: 'products', redirectTo: '/customer/dashboard', pathMatch: 'full' },
  { path: 'shopping-cart', redirectTo: '/customer/cart', pathMatch: 'full' },
  { path: 'my-orders', redirectTo: '/customer/orders', pathMatch: 'full' },// Add wishlist redirect
  { path: 'account', redirectTo: 'login', pathMatch: 'full' },
  
  // Wildcard route for 404
  { path: '**', redirectTo: '/home' }
];
