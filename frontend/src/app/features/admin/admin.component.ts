import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProductService, OrderService, ImageService } from '../../core/services';
import { AdminService } from '../../core/services/admin.service';
import { Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';
import { AdminTableComponent } from '../../shared/components/admin-table/admin-table.component';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { ProductFormComponent } from '../../shared/components/product-form/product-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrderDetailDialogComponent } from '../../shared/components/order-detail-dialog/order-detail-dialog.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    RouterModule,
    AdminTableComponent,
    TopNavbarComponent,
    ProductFormComponent,
    ConfirmDialogComponent,
    OrderDetailDialogComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'home' | 'products' | 'add-product' | 'categories' | 'orders' = 'home';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];
  categories: string[] = [];
  
  // Search and filter parameters
  searchQuery: string = '';
  selectedCategory: string = '';
  sortOrder: string = '';
  orderStatusFilter: string = '';
  
  // UI state
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';

  // Properties for orders
  loadingOrders: boolean = false;
  ordersError: string | null = null;

  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  pageIndex = 0;
  totalOrders = 0;

  productColumns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'price', header: 'Price' },
    { key: 'category', header: 'Category' },
    { key: 'stockQuantity', header: 'Stock' }
  ];

  orderColumns = [
    { key: 'orderId', header: 'Order ID' },
    { key: 'user.username', header: 'Customer' },
    { key: 'totalAmount', header: 'Total' },
    { key: 'status', header: 'Status' },
    { key: 'orderDate', header: 'Date' }
  ];

  orderStatusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private adminService: AdminService,
    private imageService: ImageService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadOrders();
    
    // Set initial active tab based on current URL
    this.setActiveTabFromUrl(this.router.url);
    
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        if (this.activeTab === 'products' && this.products.length > 0) {
          this.applyFilters();
        }
      }
    });
    
    // Listen for route changes to update active tab
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setActiveTabFromUrl(event.url);
      
      // Load orders if navigating to orders tab
      if (event.url.includes('/orders')) {
        this.loadOrders();
      }
    });
  }

  setActiveTabFromUrl(url: string) {
    if (url.includes('/products')) {
      this.activeTab = 'products';
    } else if (url.includes('/add-product')) {
      this.activeTab = 'add-product';
    } else if (url.includes('/categories')) {
      this.activeTab = 'categories';
    } else if (url.includes('/orders')) {
      this.activeTab = 'orders';
      this.loadOrders();
    } else {
      this.activeTab = 'home';
    }
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.extractCategories();
        
        // If a category is selected, apply filters
        if (this.selectedCategory) {
          this.applyFilters();
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }
  
  loadOrders(): void {
    this.loadingOrders = true;
    this.ordersError = null;
    
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        console.log('Orders loaded:', orders);
        
        // Initialize newStatus property for each order
        this.orders = orders.map(order => ({
          ...order,
          newStatus: order.status // Initialize with current status
        }));
        
        this.filteredOrders = [...this.orders];
        this.totalOrders = this.filteredOrders.length;
        this.updatePaginatedOrders();
        this.loadingOrders = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.ordersError = error.message || 'Failed to load orders';
        this.loadingOrders = false;
        
        // If we have mock data, still populate the tables
        if (this.orders && this.orders.length > 0) {
          this.filteredOrders = [...this.orders];
          this.totalOrders = this.filteredOrders.length;
          this.updatePaginatedOrders();
        }
      }
    });
  }
  
  extractCategories(): void {
    const categorySet = new Set<string>();
    this.products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    this.categories = Array.from(categorySet);
  }
  
  applyFilters(): void {
    this.loading = true;
    
    // If no filters are applied, show all products
    if (!this.searchQuery && !this.selectedCategory && !this.sortOrder) {
      this.filteredProducts = [...this.products];
      this.loading = false;
      return;
    }
    
    // Use the combined filter API
    this.productService.getFilteredProducts({
      query: this.searchQuery,
      category: this.selectedCategory,
      sortOrder: this.sortOrder
    }).subscribe({
      next: (data) => {
        this.filteredProducts = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.error = 'Failed to filter products';
        this.loading = false;
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortOrder = '';
    this.filteredProducts = [...this.products];
  }

  applyOrderFilters(): void {
    // Reset filtered orders
    this.filteredOrders = [...this.orders];
    
    // Apply status filter if selected
    if (this.orderStatusFilter) {
      this.filteredOrders = this.filteredOrders.filter(order => 
        order.status === this.orderStatusFilter
      );
    }
    
    // Update pagination after filtering
    this.totalOrders = this.filteredOrders.length;
    this.pageIndex = 0; // Reset to first page when filtering
    this.updatePaginatedOrders();
  }

  resetOrderFilters(): void {
    this.orderStatusFilter = '';
    this.filteredOrders = [...this.orders];
    this.totalOrders = this.filteredOrders.length;
    this.pageIndex = 0;
    this.updatePaginatedOrders();
  }
  
  updatePaginatedOrders(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }
  
  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedOrders();
  }

  openAddProduct() {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.productService.createProduct(result).subscribe({
          next: () => {
            this.loadProducts();
            this.successMessage = 'Product created successfully';
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.error = 'Failed to create product';
            this.loading = false;
            setTimeout(() => this.error = '', 3000);
          }
        });
      }
    });
  }

  handleProductFormSubmit(productData: any) {
    this.loading = true;
    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.loadProducts();
        this.successMessage = 'Product created successfully';
        setTimeout(() => this.successMessage = '', 3000);
        this.router.navigate(['/adminpage/products']);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.error = 'Failed to create product';
        this.loading = false;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  openEditProduct(product: Product) {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        // Ensure the productId is preserved in the result object
        result.productId = product.productId;
        this.productService.updateProduct(product.productId!, result).subscribe({
          next: () => {
            this.loadProducts();
            this.successMessage = 'Product updated successfully';
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.error = 'Failed to update product';
            this.loading = false;
            setTimeout(() => this.error = '', 3000);
          }
        });
      }
    });
  }

  openDeleteProduct(product: Product) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `Are you sure you want to delete ${product.name}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loading = true;
        this.productService.deleteProduct(product.productId!).subscribe({
          next: () => {
            this.loadProducts();
            this.successMessage = 'Product deleted successfully';
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.error = 'Failed to delete product';
            this.loading = false;
            setTimeout(() => this.error = '', 3000);
          }
        });
      }
    });
  }

  updateOrderStatus(order: any, newStatus: string) {
    if (!newStatus || order.status === newStatus) {
      console.log('No status change detected');
      return;
    }
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `Are you sure you want to update order #${order.orderId} status from ${order.status} to ${newStatus}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loading = true;
        this.adminService.updateOrderStatus(order.orderId!, newStatus).subscribe({
          next: (updatedOrder) => {
            // Update the order in the orders array
            const index = this.orders.findIndex(o => o.orderId === order.orderId);
            if (index !== -1) {
              this.orders[index] = {
                ...updatedOrder,
                newStatus: updatedOrder.status // Update the newStatus as well
              };
            }
            
            // Also update in filtered orders
            const filteredIndex = this.filteredOrders.findIndex(o => o.orderId === order.orderId);
            if (filteredIndex !== -1) {
              this.filteredOrders[filteredIndex] = {
                ...updatedOrder,
                newStatus: updatedOrder.status
              };
            }
            
            // Update paginated orders
            this.updatePaginatedOrders();
            
            this.successMessage = `Order #${order.orderId} status updated from ${order.status} to ${newStatus}`;
            this.loading = false;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            console.error('Error updating order status:', error);
            this.error = `Failed to update order status: ${error.error || error.message || 'Unknown error'}`;
            this.loading = false;
            setTimeout(() => this.error = '', 5000);
          }
        });
      }
    });
  }

  viewOrderDetails(order: Order) {
    console.log('View order details:', order);
    
    // Open the order detail dialog
    this.dialog.open(OrderDetailDialogComponent, {
      width: '800px',
      data: { order: order }
    });
  }

  navigateToAddProduct() {
    this.router.navigate(['/adminpage/add-product']);
  }

  filterProductsByCategory(category: string) {
    // Set the selected category
    this.selectedCategory = category;
    
    // Navigate to the products tab
    this.activeTab = 'products';
    this.router.navigate(['/adminpage/products'], { 
      queryParams: { category: category }
    });
    
    // Apply the filter
    this.loading = true;
    this.productService.getFilteredProducts({
      category: category
    }).subscribe({
      next: (data) => {
        this.filteredProducts = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error filtering products by category:', error);
        this.error = 'Failed to filter products';
        this.loading = false;
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });
  }

  // Helper method for the template to safely count products in a category
  getProductCountByCategory(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }
  
  // Format date for display
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
  }

  handleStatusUpdate(order: any): void {
    const newStatus = order.newStatus || order.status;
    this.updateOrderStatus(order, newStatus);
  }
} 