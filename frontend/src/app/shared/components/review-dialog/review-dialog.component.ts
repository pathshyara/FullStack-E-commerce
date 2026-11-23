import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Product } from '../../../core/models/product.model';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Add Review - {{data.product.name}}</h2>
    <mat-dialog-content>
      <div class="rating-container">
        <div>Your Rating:</div>
        <div class="stars">
          <span *ngFor="let star of [1,2,3,4,5]" 
                (click)="setRating(star)"
                (mouseenter)="hoverRating = star"
                (mouseleave)="hoverRating = 0"
                [class.filled]="(hoverRating || rating) >= star">
            ★
          </span>
        </div>
      </div>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Your Review (Optional)</mat-label>
        <textarea matInput
                  [(ngModel)]="comment"
                  placeholder="Write your review here..."
                  rows="4"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button 
              color="primary" 
              [disabled]="!rating"
              (click)="onSubmit()">
        Submit Review
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .rating-container {
      margin: 16px 0;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stars {
      cursor: pointer;
      font-size: 24px;
      color: #ccc;
    }
    .stars span {
      transition: color 0.2s;
    }
    .stars span.filled {
      color: #ffd700;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class ReviewDialogComponent implements OnInit {
  rating: number = 0;
  hoverRating: number = 0;
  comment: string = '';

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      product: Product;
      existingReview?: { rating: number; comment?: string; }
    },
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    // Clear any stored state
    this.rating = 0;
    this.hoverRating = 0;
    this.comment = '';
  }

  setRating(value: number) {
    this.rating = value;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.rating) {
      this.dialogRef.close({
        rating: this.rating,
        comment: this.comment
      });
    }
  }
} 