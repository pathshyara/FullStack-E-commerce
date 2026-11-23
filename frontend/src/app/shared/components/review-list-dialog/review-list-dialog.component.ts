import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { Product } from '../../../core/models/product.model';
import { Review } from '../../../core/services/review.service';

interface RatingStats {
  rating: number;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-review-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    StarRatingComponent
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Reviews for {{ data.product.name }}</h2>
      <mat-dialog-content>
        <div class="overall-rating">
          <div class="rating-summary">
            <div class="average-rating">
              <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
              <app-star-rating
                [rating]="averageRating"
                [showCount]="false">
              </app-star-rating>
              <span class="total-reviews">{{ data.reviews.length }} {{ data.reviews.length === 1 ? 'review' : 'reviews' }}</span>
            </div>
            <div class="rating-bars">
              <div class="rating-bar-row" *ngFor="let stat of ratingStats">
                <span class="rating-label">{{ stat.rating }}</span>
                <div class="rating-bar-container">
                  <div class="rating-bar" [style.width.%]="stat.percentage"></div>
                </div>
                <span class="rating-count">({{ stat.count }})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="reviews-list">
          <div *ngIf="data.reviews.length === 0" class="no-reviews">
            No reviews yet. Be the first to review this product!
          </div>
          
          <div *ngFor="let review of data.reviews" class="review-item">
            <div class="review-header">
              <div class="user-info">
                <strong>{{ review.username }}</strong>
                <span class="review-date">{{ review.createdAt | date:'mediumDate' }}</span>
              </div>
              <app-star-rating [rating]="review.rating"></app-star-rating>
            </div>
            <p class="review-comment" *ngIf="review.comment">{{ review.comment }}</p>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Close</button>
        <button mat-raised-button color="primary" (click)="onAddReview()">Add Review</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 600px;
    }

    mat-dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 10px;
      margin: 0;
      min-width: 500px;
    }

    .overall-rating {
      position: sticky;
      top: 0;
      background: white;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 20px;
      z-index: 1;
    }

    .rating-summary {
      display: flex;
      gap: 40px;
      align-items: flex-start;
      padding: 0 20px;
    }

    .average-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 150px;
    }

    .rating-number {
      font-size: 48px;
      font-weight: 500;
      line-height: 1;
      margin-bottom: 8px;
    }

    .total-reviews {
      color: #666;
      font-size: 14px;
      margin-top: 8px;
    }

    .rating-bars {
      flex-grow: 1;
      padding-top: 8px;
    }

    .rating-bar-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .rating-label {
      min-width: 20px;
      text-align: right;
    }

    .rating-bar-container {
      flex-grow: 1;
      height: 8px;
      background-color: #eee;
      border-radius: 4px;
      overflow: hidden;
    }

    .rating-bar {
      height: 100%;
      background-color: #ffd700;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .rating-count {
      min-width: 40px;
      font-size: 12px;
      color: #666;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .no-reviews {
      text-align: center;
      color: #666;
      padding: 20px;
    }

    .review-item {
      padding: 15px;
      border-radius: 8px;
      background-color: #f8f9fa;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .review-date {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .review-comment {
      margin: 0;
      color: #333;
      line-height: 1.5;
    }

    mat-dialog-actions {
      padding: 8px 24px;
      border-top: 1px solid #eee;
    }
  `]
})
export class ReviewListDialogComponent implements OnInit {
  averageRating: number = 0;
  ratingStats: RatingStats[] = [];

  constructor(
    public dialogRef: MatDialogRef<ReviewListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      product: Product,
      reviews: Review[]
    }
  ) {}

  ngOnInit() {
    this.calculateRatingStats();
  }

  calculateRatingStats() {
    // Initialize counts for each rating
    const ratingCounts = new Map<number, number>();
    for (let i = 1; i <= 5; i++) {
      ratingCounts.set(i, 0);
    }

    // Count reviews for each rating
    let totalRating = 0;
    this.data.reviews.forEach(review => {
      const count = ratingCounts.get(review.rating) || 0;
      ratingCounts.set(review.rating, count + 1);
      totalRating += review.rating;
    });

    // Calculate average rating
    this.averageRating = this.data.reviews.length > 0 
      ? totalRating / this.data.reviews.length 
      : 0;

    // Calculate percentages and create stats array
    const maxCount = Math.max(...Array.from(ratingCounts.values()));
    this.ratingStats = Array.from(ratingCounts.entries())
      .map(([rating, count]) => ({
        rating,
        count,
        percentage: maxCount > 0 ? (count / maxCount) * 100 : 0
      }))
      .sort((a, b) => b.rating - a.rating); // Sort by rating descending
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onAddReview(): void {
    this.dialogRef.close('add_review');
  }
} 