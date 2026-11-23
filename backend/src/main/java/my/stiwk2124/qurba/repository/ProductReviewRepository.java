package my.stiwk2124.qurba.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import my.stiwk2124.qurba.JPAentities.ProductReview;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductProductId(Long productId);
    
    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.productId = :productId")
    Double getAverageRatingForProduct(@Param("productId") Long productId);
    
    boolean existsByUserUserIdAndProductProductId(Long userId, Long productId);
}