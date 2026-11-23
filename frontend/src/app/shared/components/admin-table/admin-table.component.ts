import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ImageService } from '../../../core/services/image.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  template: `
    <div class="table-container">
      <!-- Product display with images -->
      <div *ngIf="isProductTable" class="product-grid">
        <div *ngFor="let item of paginatedData" class="product-card">
          <div class="product-image">
            <img [src]="getProductImagePath(item)" alt="{{ item.name }}" 
                 (error)="handleImageError($event, item)" />
          </div>
          <div class="product-info">
            <h3>{{ item.name }}</h3>
            <div class="product-details">
              <span class="category">{{ item.category }}</span>
              <span class="price">RM {{ item.price.toFixed(2) }}</span>
            </div>
            <p class="description">{{ item.description }}</p>
            <div class="stock">Stock: {{ item.stockQuantity }}</div>
            <div class="action-buttons">
              <button mat-mini-fab color="primary" (click)="edit.emit(item)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-mini-fab color="warn" (click)="delete.emit(item)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular table for non-product data -->
      <table *ngIf="!isProductTable" mat-table [dataSource]="paginatedData" class="mat-elevation-z2">
        <ng-container *ngFor="let col of columns" [matColumnDef]="col.key">
          <th mat-header-cell *matHeaderCellDef> {{ col.header }} </th>
          <td mat-cell *matCellDef="let element"> {{ element[col.key] }} </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let element">
            <div class="action-buttons">
              <button mat-mini-fab color="primary" (click)="edit.emit(element)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-mini-fab color="warn" (click)="delete.emit(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <!-- Pagination -->
      <mat-paginator
        [length]="data.length"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 25]"
        (page)="onPageChange($event)"
        aria-label="Select page">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container { 
      width: 100%; 
      overflow-x: auto; 
    }
    table { 
      width: 100%; 
      min-width: 600px; 
    }
    th.mat-header-cell, td.mat-cell { 
      padding: 8px; 
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    button[mat-mini-fab] {
      transform: scale(0.8);
    }
    
    /* Product grid styles */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .product-card {
      display: flex;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      background-color: white;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .product-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .product-image {
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      padding: 10px;
    }
    
    .product-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .product-info {
      flex: 1;
      padding: 15px;
      position: relative;
    }
    
    .product-info h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .product-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .category {
      font-size: 12px;
      background-color: #e3f2fd;
      padding: 2px 8px;
      border-radius: 12px;
      color: #1976d2;
    }
    
    .price {
      font-weight: bold;
      color: #d32f2f;
    }
    
    .description {
      font-size: 14px;
      color: #666;
      margin: 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .stock {
      font-size: 13px;
      color: #555;
      margin-bottom: 10px;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  `]
})
export class AdminTableComponent {
  @Input() columns: { key: string, header: string }[] = [];
  @Input() data: any[] = [];
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  // Pagination properties
  pageSize = 10;
  currentPage = 0;
  
  constructor(private imageService: ImageService) {}
  
  get displayedColumns() {
    return [...this.columns.map(c => c.key), 'actions'];
  }
  
  get isProductTable(): boolean {
    // Check if this is a product table by looking for product-specific fields
    return this.data.length > 0 && 
           'name' in this.data[0] && 
           'price' in this.data[0] &&
           'category' in this.data[0];
  }
  
  get paginatedData(): any[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.data.slice(start, end);
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  
  getProductImagePath(product: Product): string {
    if (!product.category || !product.name) {
      return this.imageService.getDefaultImageUrl();
    }
    
    // If product has an imagePath, make sure it uses .png extension
    if (product.imagePath) {
      if (!product.imagePath.toLowerCase().endsWith('.png')) {
        const fixedPath = product.imagePath.replace(/\.[^.]+$/, '.png');
        return this.imageService.getSafeUrl(fixedPath);
      }
      return this.imageService.getSafeUrl(product.imagePath);
    }
    
    return this.imageService.getSafeProductImageUrl(product.category, product.name);
  }
  
  handleImageError(event: any, product: Product): void {
    // Mark this URL as failed so we don't try to load it again
    const imgElement = event.target;
    this.imageService.markImageAsFailed(imgElement.src);
    
    // Set to default image
    imgElement.src = this.imageService.getDefaultImageUrl();
  }
} 