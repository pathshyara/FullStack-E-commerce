import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ReviewService } from '../../core/services/review.service';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { ImageService } from '../../core/services/image.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerHeaderComponent } from '../../shared/components/customer-header/customer-header.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { ReviewDialogComponent } from '../../shared/components/review-dialog/review-dialog.component';
import { ReviewListDialogComponent } from '../../shared/components/review-list-dialog/review-list-dialog.component';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatDialogModule,
    CustomerHeaderComponent,
    StarRatingComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = []; // Products after pagination is applied
  categories: string[] = [];
  cartItemCount: number = 0;
  cartAnimation: boolean = false;
  
  // Search and filter parameters
  searchQuery: string = '';
  selectedCategory: string = '';
  sortOrder: string = '';
  
  // Product being added to cart
  selectedProduct: Product | null = null;
  quantity: number = 1;
  
  // UI state
  loading: boolean = false;
  error: string = '';
  successMessage: string = '';
  
  // Pagination
  pageSize = 10; // Number of products per page
  pageSizeOptions = [5, 10, 25];
  pageIndex = 0;
  totalProducts = 0;
  
  wishlist: Product[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private imageService: ImageService,
    private reviewService: ReviewService,
    private dialog: MatDialog,
    private wishlistService: WishlistService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.subscriptions.push(
      this.cartService.cartCount$.subscribe(count => {
        this.cartItemCount = count;
      })
    );
    this.wishlistService.wishlist$.subscribe((wishlist: Product[]) => {
      this.wishlist = wishlist;
    });
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions when component is destroyed
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        console.log('Products loaded:', data.length);
        this.products = data;
        this.filteredProducts = [...this.products];
        this.totalProducts = data.length;
        this.updatePaginatedProducts();
        this.extractCategories();
        // Load ratings for all products
        this.products.forEach(product => {
          if (product.productId) {
            this.loadProductRating(product.productId);
            this.loadProductReviews(product.productId);
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
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
    this.error = ''; // Clear any previous errors
    
    // Check if we're applying any filters
    const isFiltering = this.searchQuery || this.selectedCategory || this.sortOrder;
    
    if (!isFiltering) {
      // If no filters are applied, refresh all products
      this.productService.getAllProducts().subscribe({
        next: (data) => {
          this.products = data;
          this.filteredProducts = data;
          this.totalProducts = data.length;
          this.pageIndex = 0; // Reset to first page when filters change
          this.updatePaginatedProducts();
          // Load ratings and reviews for all products
          this.products.forEach(product => {
            if (product.productId) {
              this.loadProductRating(product.productId);
              this.loadProductReviews(product.productId);
            }
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching products:', error);
          this.error = 'Failed to load products. Please try again.';
          this.loading = false;
        }
      });
      return;
    }
    
    // Use the combined filter API
    const filterParams: any = {};
    
    // Only add parameters that have values
    if (this.searchQuery) filterParams.query = this.searchQuery;
    if (this.selectedCategory) filterParams.category = this.selectedCategory;
    if (this.sortOrder) filterParams.sortOrder = this.sortOrder;
    
    console.log('Applying filters with params:', filterParams);
    
    this.productService.getFilteredProducts(filterParams).subscribe({
      next: (data) => {
        console.log('Filtered products received:', data.length);
        this.filteredProducts = data;
        this.totalProducts = data.length;
        this.pageIndex = 0; // Reset to first page when filters change
        this.updatePaginatedProducts();
        // Load ratings and reviews for filtered products
        this.filteredProducts.forEach(product => {
          if (product.productId) {
            this.loadProductRating(product.productId);
            this.loadProductReviews(product.productId);
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.error = 'Failed to filter products. Please try again.';
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortOrder = '';
    this.loading = true;
    
    // Refresh products from server
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.totalProducts = data.length;
        this.pageIndex = 0; // Reset to first page
        this.updatePaginatedProducts();
        // Load ratings and reviews for all products
        this.products.forEach(product => {
          if (product.productId) {
            this.loadProductRating(product.productId);
            this.loadProductReviews(product.productId);
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  // Handle pagination
  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedProducts();
  }

  // Update the paginated products based on current page and page size
  updatePaginatedProducts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
    
    // Ensure all paginated products have their reviews and ratings loaded
    this.paginatedProducts.forEach(product => {
      if (product.productId) {
        // Only load if not already loaded
        this.loadProductRating(product.productId);
        this.loadProductReviews(product.productId);
      }
    });
  }

  openAddToCartModal(product: Product): void {
    this.selectedProduct = product;
    this.quantity = 1;
  }

  closeModal(): void {
    this.selectedProduct = null;
    this.quantity = 1;
  }

  increaseQuantity(): void {
    if (this.selectedProduct && this.quantity < this.selectedProduct.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  validateQuantity(): void {
    if (!this.selectedProduct) return;
    
    // Ensure quantity is a number
    if (isNaN(this.quantity)) {
      this.quantity = 1;
    }
    
    // Ensure quantity is an integer
    this.quantity = Math.floor(this.quantity);
    
    // Ensure quantity is within bounds
    if (this.quantity < 1) {
      this.quantity = 1;
    } else if (this.quantity > this.selectedProduct.stockQuantity) {
      this.quantity = this.selectedProduct.stockQuantity;
    }
  }

  addToCart(): void {
    if (!this.selectedProduct || !this.selectedProduct.productId) {
      this.error = 'Invalid product selected';
      this.loading = false;
      setTimeout(() => {
        this.error = '';
      }, 3000);
      return;
    }
    
    this.loading = true;
    
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please log in to add items to your cart';
      this.loading = false;
      setTimeout(() => {
        this.error = '';
      }, 3000);
      return;
    }
    
    this.cartService.addToCart(this.selectedProduct.productId, this.quantity).subscribe({
      next: (response) => {
        console.log('Added to cart:', response);
        this.successMessage = `${this.quantity} ${this.selectedProduct!.name} added to cart`;
        this.loading = false;
        this.closeModal();
        
        // Update cart count and show animation
        this.cartAnimation = true;
        setTimeout(() => {
          this.cartAnimation = false;
        }, 500);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.error = 'Failed to add item to cart. Please try again.';
        this.loading = false;
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    // Redirect to login page
    window.location.href = '/login';
  }

  getProductImagePath(product: Product): string {
    if (!product.category || !product.name) return this.imageService.getDefaultImageUrl();
    
    // If product has an imagePath, make sure it uses .png extension
    if (product.imagePath) {
      if (!product.imagePath.toLowerCase().endsWith('.png')) {
        console.log(`Converting image path to use .png extension: ${product.imagePath}`);
        const fixedPath = product.imagePath.replace(/\.[^.]+$/, '.png');
        return this.imageService.getSafeUrl(fixedPath);
      }
      return this.imageService.getSafeUrl(product.imagePath);
    }
    
    return this.imageService.getSafeProductImageUrl(product.category, product.name);
  }

  getEndIndex(): number {
    const endIndex = (this.pageIndex + 1) * this.pageSize;
    return Math.min(endIndex, this.totalProducts);
  }

  openReviewDialog(product: Product): void {
    const sub = this.authService.currentUser.subscribe(currentUser => {
      if (!currentUser?.userId) {
        this.showMessage('Please log in to submit a review', true);
        return;
      }

      const userId = currentUser.userId;

      // First check if user has already reviewed this product
      this.reviewService.getProductReviews(product.productId!.toString()).subscribe({
        next: (reviews) => {
          const existingReview = reviews.find(r => r.userId === userId.toString());
          
          if (existingReview) {
            this.showMessage('You have already reviewed this product', true);
            return;
          }
    
          const dialogRef = this.dialog.open(ReviewDialogComponent, {
            data: { 
              product,
              existingReview: undefined
            },
            position: {
              top: '50px'
            },
            width: '400px',
            height: '400px',
            disableClose: false
          });

          const dialogSub = dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.submitReview(product.productId!, result.rating, result.comment);
            }
          });
          this.subscriptions.push(dialogSub);
        },
        error: (error) => {
          console.error('Error checking existing review:', error);
          this.showMessage('Error checking existing review. Please try again.', true);
        }
      });
    });
    this.subscriptions.push(sub);
  }

  submitReview(productId: number, rating: number, comment?: string): void {
    const sub = this.authService.currentUser.subscribe(currentUser => {
      if (!currentUser?.userId) {
        this.showMessage('Please log in to submit a review', true);
      return;
    }
    
      const userId = currentUser.userId;
    
      this.reviewService.submitReview(productId.toString(), { 
        rating, 
        comment,
        userId: userId
      }).subscribe({
        next: () => {
          this.showMessage('Review submitted successfully!');
          // Refresh the product's rating
        this.loadProductRating(productId);
        this.loadProductReviews(productId);
          // Clear any stored review state from session storage
          sessionStorage.removeItem('pendingReview');
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          if (error.message === 'You have already reviewed this product') {
            this.showMessage('You have already reviewed this product', true);
          } else {
            this.showMessage(error.message || 'Failed to submit review. Please try again later.', true);
          }
        }
      });
    });
    this.subscriptions.push(sub);
  }

  openReviewListDialog(product: Product): void {
    this.reviewService.getProductReviews(product.productId!.toString()).subscribe({
      next: (reviews) => {
        const dialogRef = this.dialog.open(ReviewListDialogComponent, {
          data: { product, reviews },
          position: {
            top: '50px'
          },
          width: '500px',
          height: '500px'
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === 'add_review') {
            this.openReviewDialog(product);
          }
        });
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.showMessage('Error loading reviews. Please try again.', true);
      }
    });
  }

  private showMessage(message: string, isError: boolean = false) {
    if (isError) {
      this.error = message;
      this.successMessage = '';
    } else {
      this.successMessage = message;
      this.error = '';
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      if (isError) {
        this.error = '';
      } else {
        this.successMessage = '';
      }
    }, 3000);
  }

  loadProductRating(productId: number): void {
    this.reviewService.getProductAverageRating(productId.toString()).subscribe({
      next: (rating) => {
        // Update in main products array
        const product = this.products.find(p => p.productId === productId);
        if (product) {
          product.averageRating = rating;
        }
        
        // Also update in filtered products array
        const filteredProduct = this.filteredProducts.find(p => p.productId === productId);
        if (filteredProduct) {
          filteredProduct.averageRating = rating;
        }
      },
      error: (error) => {
        console.error('Error loading product rating:', error);
      }
    });
  }

  loadProductReviews(productId: number): void {
    this.reviewService.getProductReviews(productId.toString()).subscribe({
      next: (reviews) => {
        // Update in main products array
        const product = this.products.find(p => p.productId === productId);
        if (product) {
          product.totalReviews = reviews.length;
        }
        
        // Also update in filtered products array
        const filteredProduct = this.filteredProducts.find(p => p.productId === productId);
        if (filteredProduct) {
          filteredProduct.totalReviews = reviews.length;
        }
      },
      error: (error) => {
        console.error('Error loading product reviews:', error);
      }
    });
  }

  addToWishlist(product: Product): void {
    this.wishlistService.addToWishlist(product);
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }
}