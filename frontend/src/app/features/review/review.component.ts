import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService, Review } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { CustomerHeaderComponent } from '../../shared/components/customer-header/customer-header.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    StarRatingComponent, 
    CustomerHeaderComponent
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  reviewForm: FormGroup;
  reviews: Review[] = [];
  productId: number = 0;
  product: Product | null = null;
  averageRating: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;
  cartItemCount: number = 0;
  cartAnimation: boolean = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Get productId from route params or use a default for testing
    this.route.params.subscribe(params => {
      const id = params['productId'] || '1';
      this.productId = parseInt(id, 10);
      this.loadReviews();
      this.loadProduct();
    });
    
    this.updateCartItemCount();
  }

  loadReviews(): void {
    if (this.productId) {
      this.reviewService.getProductReviews(this.productId.toString()).subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
        error: (err: any) => {
          console.error('Error loading reviews:', err);
          this.errorMessage = 'Failed to load reviews. Please try again later.';
        }
      });

      this.reviewService.getProductRating(this.productId).subscribe({
        next: (rating: any) => {
          this.averageRating = rating.averageRating;
        },
        error: (err: any) => {
          console.error('Error loading average rating:', err);
        }
      });
    }
  }
  
  loadProduct(): void {
    if (this.productId) {
      this.productService.getProduct(this.productId).subscribe({
        next: (product: Product) => {
          this.product = product;
        },
        error: (err: any) => {
          console.error('Error loading product:', err);
          this.errorMessage = 'Failed to load product details.';
        }
      });
    }
  }
  
  updateCartItemCount(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      },
      error: (error) => {
        console.error('Error fetching cart:', error);
        this.cartItemCount = 0;
      }
    });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.errorMessage = 'You must be logged in to submit a review.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const reviewData = this.reviewForm.value;
    const rating = reviewData.rating;
    const comment = reviewData.comment;

    this.reviewService.addReview(this.productId, rating, comment).subscribe({
      next: () => {
        this.successMessage = 'Review submitted successfully!';
        this.reviewForm.reset({ rating: 5 });
        this.loadReviews(); // Reload reviews to show the new one
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Failed to submit review. Please try again later.';
        this.isSubmitting = false;
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }

  // Helper method to generate an array for star rating display
  generateStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
} 