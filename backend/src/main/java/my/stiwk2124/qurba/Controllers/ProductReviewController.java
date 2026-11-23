package my.stiwk2124.qurba.Controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import my.stiwk2124.qurba.JPAentities.ProductReview;
import my.stiwk2124.qurba.dto.ProductReviewRequest;
import my.stiwk2124.qurba.dto.ProductReviewResponse;
import my.stiwk2124.qurba.service.ProductReviewService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ProductReviewController {
    @Autowired
    private ProductReviewService reviewService;

    @PostMapping("/{productId}/reviews")
    public ResponseEntity<?> createReview(
            @PathVariable Long productId,
            @RequestParam Long userId,
            @RequestBody ProductReviewRequest request) {
        try {
            // No longer verify userId against authenticated user
            // This allows any user to submit a review
            ProductReview review = reviewService.createReview(
                productId, 
                userId, 
                request.getRating(),
                request.getComment()
            );
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{productId}/reviews")
    public ResponseEntity<List<ProductReviewResponse>> getProductReviews(@PathVariable Long productId) {
        List<ProductReviewResponse> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{productId}/rating")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable Long productId) {
        Double avgRating = reviewService.getAverageRating(productId);
        Map<String, Double> response = new HashMap<>();
        response.put("averageRating", avgRating != null ? avgRating : 0.0);
        return ResponseEntity.ok(response);
    }
}