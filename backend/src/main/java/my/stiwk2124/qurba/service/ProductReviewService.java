package my.stiwk2124.qurba.service;

import my.stiwk2124.qurba.JPAentities.Product;
import my.stiwk2124.qurba.JPAentities.ProductReview;
import my.stiwk2124.qurba.JPAentities.User;
import my.stiwk2124.qurba.dto.ProductReviewResponse;
import my.stiwk2124.qurba.repository.ProductReviewRepository;
import my.stiwk2124.qurba.repository.ProductRepository;
import my.stiwk2124.qurba.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductReviewService {
    @Autowired
    private ProductReviewRepository reviewRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;

    public ProductReview createReview(Long productId, Long userId, Integer rating, String comment) {
        // Check if user has already reviewed this product
        if (reviewRepository.existsByUserUserIdAndProductProductId(userId, productId)) {
            throw new IllegalStateException("User has already reviewed this product");
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
            
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    public List<ProductReviewResponse> getProductReviews(Long productId) {
        List<ProductReview> reviews = reviewRepository.findByProductProductId(productId);
        return reviews.stream()
            .map(review -> new ProductReviewResponse(
                review.getReviewId(),
                review.getUser().getUserId(),
                review.getUser().getUsername(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
            ))
            .collect(Collectors.toList());
    }

    public Double getAverageRating(Long productId) {
        return reviewRepository.getAverageRatingForProduct(productId);
    }
}