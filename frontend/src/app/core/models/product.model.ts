export interface Product {
    productId?: number;
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
    imageUrl?: string;
    imagePath?: string;
    averageRating?: number;
    totalReviews?: number;
    reviews?: Review[];
}

export interface Review {
    reviewId: number;
    userId: number;
    username: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}

export interface ProductFilter {
    query?: string;
    category?: string;
    sortOrder?: string;
} 