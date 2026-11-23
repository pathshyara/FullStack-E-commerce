import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Order } from '../../../core/models/order.model';
import { ImageService } from '../../../core/services/image.service';

export interface OrderDetailDialogData {
  order: Order;
}

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="order-detail-dialog">
      <h2 mat-dialog-title>Order #{{ data.order.orderId }}</h2>
      
      <div mat-dialog-content>
        <div class="order-info">
          <div class="order-info-item">
            <span class="label">Order Date:</span>
            <span>{{ formatDate(data.order.orderDate) }}</span>
          </div>
          <div class="order-info-item">
            <span class="label">Status:</span>
            <span class="status-badge {{ data.order.status.toLowerCase() }}">{{ data.order.status }}</span>
          </div>
          <div class="order-info-item">
            <span class="label">Customer:</span>
            <span>{{ data.order.user?.username || 'Unknown' }}</span>
          </div>
        </div>
        
        <h3>Items</h3>
        <div class="order-items">
          <div *ngIf="!data.order.items?.length" class="no-items">
            <p>No items found in this order.</p>
          </div>
          
          <div *ngFor="let item of data.order.items" class="order-item">
            <div class="item-image">
              <img [src]="getProductImagePath(item.product)" 
                   alt="{{ item.product?.name || 'Product' }}"
                   (error)="handleImageError($event, item.product)">
            </div>
            <div class="item-details">
              <h4>{{ item.product?.name || 'Unknown Product' }}</h4>
              <p class="item-category">{{ item.product?.category || 'Uncategorized' }}</p>
            </div>
            <div class="item-price">
              <p>RM {{ item.price ? item.price.toFixed(2) : '0.00' }} × {{ item.quantity || 0 }}</p>
              <p class="item-subtotal">RM {{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}</p>
            </div>
          </div>
        </div>
        
        <div class="order-totals">
          <div class="total-item">
            <span>Subtotal:</span>
            <span>RM {{ data.order.totalAmount ? data.order.totalAmount.toFixed(2) : '0.00' }}</span>
          </div>
          <div class="total-item">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div class="total-item total">
            <span>Total:</span>
            <span>RM {{ data.order.totalAmount ? data.order.totalAmount.toFixed(2) : '0.00' }}</span>
          </div>
        </div>
      </div>
      
      <div mat-dialog-actions>
        <button mat-button (click)="onClose()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .order-detail-dialog {
      padding: 1rem;
      max-width: 800px;
    }
    
    .order-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
    }
    
    .order-info-item {
      display: flex;
      flex-direction: column;
    }
    
    .label {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.3rem;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      font-size: 0.8rem;
      text-transform: uppercase;
    }
    
    .pending {
      background-color: #fff8e1;
      color: #f57c00;
    }
    
    .confirmed {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .shipped {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    
    .delivered {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    
    .cancelled {
      background-color: #ffebee;
      color: #d32f2f;
    }
    
    h3 {
      margin: 1.5rem 0 1rem;
      color: #333;
    }
    
    .order-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .order-item {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 4px;
      align-items: center;
    }
    
    .item-image {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .item-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .item-details h4 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
    }
    
    .item-category {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }
    
    .item-price {
      text-align: right;
    }
    
    .item-price p {
      margin: 0;
    }
    
    .item-subtotal {
      font-weight: bold;
      margin-top: 0.5rem !important;
    }
    
    .no-items {
      padding: 1rem;
      text-align: center;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .order-totals {
      margin-top: 1.5rem;
      border-top: 1px solid #eee;
      padding-top: 1rem;
    }
    
    .total-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    
    .total {
      font-weight: bold;
      font-size: 1.1rem;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #eee;
    }
    
    [mat-dialog-actions] {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  `]
})
export class OrderDetailDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDetailDialogData,
    private imageService: ImageService
  ) {}
  
  ngOnInit(): void {
    // No initialization needed
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getProductImagePath(product: any): string {
    if (!product || !product.category || !product.name) {
      return this.imageService.getDefaultImageUrl();
    }
    
    // If product has an imagePath, use it
    if (product.imagePath) {
      return this.imageService.getSafeUrl(product.imagePath);
    }
    
    // Otherwise try to get an image based on category and name
    return this.imageService.getSafeProductImageUrl(product.category, product.name);
  }
  
  handleImageError(event: any, product: any): void {
    // Mark this URL as failed so we don't try to load it again
    const imgElement = event.target;
    this.imageService.markImageAsFailed(imgElement.src);
    
    // Try to get a static product image based on the product name
    if (product && product.name) {
      const lowerName = product.name.toLowerCase();
      
      if (lowerName.includes('minyak bidara') && lowerName.includes('45ml')) {
        // Use the 45ML Minyak Bidara image
        imgElement.src = 'assets/logo.png';
        return;
      } else if (lowerName.includes('minyak bidara') && lowerName.includes('120ml')) {
        // Use the 120ML Minyak Bidara image
        imgElement.src = 'assets/logo.png';
        return;
      } else if (lowerName.includes('zafaran') || lowerName.includes('saffron')) {
        imgElement.src = 'assets/mee-tarik-saffron.png';
        return;
      } else if (lowerName.includes('madu minda')) {
        imgElement.src = 'assets/logo.png';
        return;
      } else if (lowerName.includes('tomyam')) {
        imgElement.src = 'assets/tomyam-odeen.png';
        return;
      } else if (lowerName.includes('perisa kari')) {
        imgElement.src = 'assets/perisa-kari.png';
        return;
      } else if (lowerName.includes('sup')) {
        imgElement.src = 'assets/sup.png';
        return;
      }
    }
    
    // Set to default image as last resort
    imgElement.src = 'assets/logo.png';
  }
} 