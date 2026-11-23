package my.stiwk2124.qurba.dto;

public class ProductReviewRequest {
    private Integer rating;
    private String comment;

    // Getters and setters
    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}