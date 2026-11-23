import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Review {
  reviewId: string;
  userId: string;
  username: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ReviewSubmission {
  rating: number;
  comment?: string;
  userId: number;
}

interface RatingResponse {
  averageRating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  // Submit a new review for a product
  submitReview(productId: string, review: ReviewSubmission): Observable<any> {
    const params = { userId: review.userId.toString() };
    return this.http.post(`${this.apiUrl}/${productId}/reviews`, review, { params })
      .pipe(
        catchError(error => {
          console.error('Error submitting review:', error);
          if (error.status === 403) {
            return throwError(() => new Error('You are not authorized to submit this review. Please log in.'));
          }
          if (error.status === 400 && error.error?.error?.includes('User has already reviewed this product')) {
            return throwError(() => new Error('You have already reviewed this product'));
          }
          return throwError(() => new Error('Failed to submit review. Please try again later.'));
        })
      );
  }

  // Get all reviews for a product
  getProductReviews(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${productId}/reviews`);
  }

  // Get average rating for a product
  getProductAverageRating(productId: string): Observable<number> {
    return this.http.get<RatingResponse>(`${this.apiUrl}/${productId}/rating`)
      .pipe(map(response => response.averageRating));
  }
  
  // Alias for getProductAverageRating to maintain compatibility with review component
  getProductRating(productId: number): Observable<RatingResponse> {
    return this.http.get<RatingResponse>(`${this.apiUrl}/${productId}/rating`);
  }
  
  // Add a review - convenience method that wraps submitReview
  addReview(productId: number, rating: number, comment?: string): Observable<any> {
    const userId = JSON.parse(localStorage.getItem('currentUser') || '{}')?.userId;
    if (!userId) {
      return throwError(() => new Error('You must be logged in to submit a review.'));
    }
    
    return this.submitReview(productId.toString(), {
      rating,
      comment,
      userId
    });
  }
} 