import { Component, Input, Output, EventEmitter, Inject, Optional, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Product } from '../../../core/models/product.model';
import { AdminService } from '../../../core/services/admin.service';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatExpansionModule
  ],
  template: `
    <div class="dialog-container">
    <h2 mat-dialog-title>{{ editMode ? 'Edit' : 'Add' }} Product</h2>
      <div class="scrollable-content">
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="product-form">
      <mat-form-field appearance="fill">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required>
        <mat-error *ngIf="form.get('name')?.errors?.['required']">Name is required</mat-error>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Description</mat-label>
        <textarea matInput formControlName="description" rows="3"></textarea>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Price</mat-label>
        <input matInput type="number" formControlName="price" required min="0">
        <mat-error *ngIf="form.get('price')?.errors?.['required']">Price is required</mat-error>
        <mat-error *ngIf="form.get('price')?.errors?.['min']">Price must be greater than 0</mat-error>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Category</mat-label>
        <mat-select formControlName="category" required>
          <mat-option *ngFor="let category of availableCategories" [value]="category">
            {{ category }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="form.get('category')?.errors?.['required']">Category is required</mat-error>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Stock Quantity</mat-label>
        <input matInput type="number" formControlName="stockQuantity" required min="0">
        <mat-error *ngIf="form.get('stockQuantity')?.errors?.['required']">Stock quantity is required</mat-error>
        <mat-error *ngIf="form.get('stockQuantity')?.errors?.['min']">Stock quantity must be greater than 0</mat-error>
      </mat-form-field>

          <!-- Image Upload Section -->
      <div class="form-section" *ngIf="!editMode">
            <h3>Product Image</h3>
            
            <!-- Image upload only for new products -->
            <div class="upload-container">
              <label for="image-upload" class="upload-label">
                <span>Choose Image File</span>
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/jpeg,image/png,image/webp" 
                  (change)="onFileSelected($event)"
                  #fileInput>
              </label>
              <span class="file-name">{{ selectedFileName || 'No file selected' }}</span>
            </div>
            
            <!-- Image preview -->
            <div *ngIf="imagePreview" class="image-preview-container">
              <p>Image Preview:</p>
              <img [src]="imagePreview" alt="Preview" class="image-preview">
            </div>
            
            <p class="image-info" *ngIf="form.get('category')?.value">
              <strong>Image will be saved as:</strong><br>
              <code>assets/images/products/{{ form.get('category')?.value }}/{{ form.get('name')?.value || '[Product Name]' }}.[extension]</code>
            </p>
            
            <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
              <div class="progress-bar" [style.width.%]="uploadProgress"></div>
              <span>{{ uploadProgress }}%</span>
          </div>
            
            <p *ngIf="uploadError" class="upload-error">{{ uploadError }}</p>
            <p *ngIf="uploadSuccess" class="upload-success">{{ uploadSuccess }}</p>
      </div>

      <div class="actions">
            <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
      </div>
    </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      max-height: 70vh;
      padding-right: 8px;
    }
    
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0 1rem 1rem 1rem;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
      position: sticky;
      bottom: 0;
      background-color: white;
      padding: 1rem 0;
      border-top: 1px solid #f0f0f0;
    }
    
    .form-section {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
    
    .image-info {
      font-size: 0.9rem;
      color: #555;
      margin: 1rem 0;
    }
    
    code {
      background-color: #e9e9e9;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
      word-break: break-all;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    .upload-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .upload-label {
      display: inline-block;
      padding: 8px 16px;
      background-color: #1976d2;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .upload-label:hover {
      background-color: #1565c0;
    }
    
    input[type="file"] {
      display: none;
    }
    
    .file-name {
      color: #666;
      font-size: 0.9rem;
    }
    
    .image-preview-container {
      margin: 1rem 0;
    }
    
    .image-preview {
      max-width: 100%;
      max-height: 200px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px;
      background-color: white;
    }
    
    .upload-progress {
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 10px;
      margin: 1rem 0;
      position: relative;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background-color: #4caf50;
      border-radius: 10px;
      transition: width 0.3s ease;
    }
    
    .upload-progress span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #333;
      font-size: 12px;
      font-weight: bold;
    }
    
    .upload-error {
      color: #d32f2f;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }
    
    .upload-success {
      color: #388e3c;
      font-size: 0.9rem;
      margin: 0.5rem 0;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  @Input() productData?: Product;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancelForm = new EventEmitter<void>();

  editMode = false;
  form: FormGroup;
  
  // Image upload properties
  selectedFile: File | null = null;
  selectedFileName: string = '';
  imagePreview: string | null = null;
  uploadProgress: number = 0;
  uploadError: string = '';
  uploadSuccess: string = '';
  
  // Available categories
  availableCategories: string[] = [
    'Books',
    'Electronics',
    'Clothing',
    'Home',
    'Beauty',
    'Sports'
  ];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private imageService: ImageService,
    private http: HttpClient,
    @Optional() private dialogRef?: MatDialogRef<ProductFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: Product
  ) {
    // Initialize form
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      imagePath: ['']
    });
    
    // If data is provided via dialog, use it
    if (data) {
      this.productData = data;
    }
  }

  ngOnInit() {
    // If product data is provided, populate the form
    if (this.productData) {
      this.editMode = true;
      this.form.patchValue({
        name: this.productData.name,
        description: this.productData.description,
        price: this.productData.price,
        category: this.productData.category,
        stockQuantity: this.productData.stockQuantity,
        imagePath: this.productData.imagePath
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    
    // Get form values
    const formData = this.form.value;
    
    // If it's a new product and an image was selected, upload it
    if (!this.editMode && this.selectedFile) {
      this.uploadImage().then(success => {
        if (success) {
          // Add the image path to the form data
          formData.imagePath = `assets/images/products/${formData.category}/${formData.name}.${this.getFileExtension(this.selectedFile!.name)}`;
          
          // Submit the form
          this.submitForm(formData);
        }
      });
    } else {
      // If no image was selected or it's an edit, just submit the form
      this.submitForm(formData);
    }
  }

  submitForm(formData: any) {
    // Emit the form data
    this.formSubmit.emit(formData);
    
    // If in dialog mode, close the dialog
    if (this.dialogRef) {
      this.dialogRef.close(formData);
    }
  }

  onCancel() {
    // Emit cancel event
    this.cancelForm.emit();
    
    // If in dialog mode, close the dialog
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async uploadImage(): Promise<boolean> {
    if (!this.selectedFile) {
      return true; // No file to upload, consider it a success
    }
    
    return new Promise<boolean>((resolve) => {
      // In a real application, you would upload the file to a server
      // For now, we'll simulate the upload with a timeout
      
      this.uploadProgress = 0;
      this.uploadError = '';
      this.uploadSuccess = '';
      
      const interval = setInterval(() => {
        this.uploadProgress += 10;
        
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
          this.uploadSuccess = 'Image uploaded successfully!';
          resolve(true);
        }
      }, 300);
      
      // Simulate a potential error
      if (this.selectedFile && this.selectedFile.size > 5000000) { // 5MB
        clearInterval(interval);
        this.uploadError = 'File is too large. Maximum size is 5MB.';
        resolve(false);
      }
    });
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'png';
  }

  getProductImagePath(product: Product): string {
    if (!product.category || !product.name) {
      return this.imageService.getDefaultImageUrl();
    }
    
    if (product.imagePath) {
      return this.imageService.getSafeUrl(product.imagePath);
    }
    
    return this.imageService.getSafeProductImageUrl(product.category, product.name);
  }

  getExamplesForCategory(category: string): string[] {
    const guidelines = this.adminService.getProductImageGuidelines();
    const categoryGuideline = guidelines.find(g => g.category === category);
    return categoryGuideline ? categoryGuideline.examples : [];
  }
} 