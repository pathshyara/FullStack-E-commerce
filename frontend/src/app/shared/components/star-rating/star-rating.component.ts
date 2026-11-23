import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="!readonly">
      <div class="stars">
        <span 
          *ngFor="let star of stars; let i = index" 
          class="star"
          [class.filled]="star"
          [class.half]="isHalfStar(i)"
          (click)="!readonly && onStarClick(i + 1)"
          (mouseenter)="!readonly && onStarHover(i + 1)"
          (mouseleave)="!readonly && onStarLeave()"
        >
          ★
        </span>
      </div>
      <ng-container *ngIf="showCount && totalRatings !== undefined">
        <span class="rating-count">
          ({{ totalRatings }})
        </span>
        <span 
          class="review-link"
          (click)="onReviewClick($event)"
        >review</span>
      </ng-container>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .stars {
      display: inline-flex;
      gap: 2px;
    }

    .star {
      font-size: 20px;
      color: #ddd;
      cursor: default;
      transition: color 0.2s ease;
      user-select: none;
    }

    .star.filled {
      color: #ffd700;
      text-shadow: 0 0 1px #b39700;
    }

    .star.half {
      position: relative;
      color: #ddd;
    }

    .star.half:after {
      content: '★';
      position: absolute;
      left: 0;
      top: 0;
      width: 50%;
      color: #ffd700;
      overflow: hidden;
      text-shadow: 0 0 1px #b39700;
    }

    .interactive .star {
      cursor: pointer;
    }

    .interactive .star:hover {
      color: #ffd700;
      transform: scale(1.1);
    }

    .rating-count {
      font-size: 14px;
      color: #666;
    }

    .review-link {
      font-size: 14px;
      color: #0066cc;
      text-decoration: underline;
      cursor: pointer;
      margin-left: 2px;
    }

    .review-link:hover {
      color: #0052a3;
    }
  `]
})
export class StarRatingComponent implements OnInit, OnChanges {
  @Input() rating: number = 0;
  @Input() readonly: boolean = true;
  @Input() showCount: boolean = false;
  @Input() totalRatings?: number;
  @Output() ratingChange = new EventEmitter<number>();
  @Output() reviewClick = new EventEmitter<void>();

  stars: boolean[] = Array(5).fill(false);
  hoveredRating: number | null = null;

  ngOnInit() {
    this.updateStars();
  }

  ngOnChanges() {
    this.updateStars();
  }

  private updateStars() {
    const rating = this.hoveredRating ?? this.rating;
    this.stars = this.stars.map((_, index) => (index + 1) <= Math.floor(rating));
  }

  isHalfStar(index: number): boolean {
    const rating = this.hoveredRating ?? this.rating;
    const threshold = index + 1;
    return !this.stars[index] && rating > index && rating < threshold;
  }

  onStarClick(rating: number) {
    this.rating = rating;
    this.ratingChange.emit(rating);
  }

  onStarHover(rating: number) {
    this.hoveredRating = rating;
    this.updateStars();
  }

  onStarLeave() {
    this.hoveredRating = null;
    this.updateStars();
  }

  onReviewClick(event: Event) {
    event.stopPropagation(); // Prevent event bubbling
    this.reviewClick.emit();
  }
} 