import "./ProductReview.css";
import React, { useState,useEffect } from "react";
import axios from "axios";
import { useLoading } from "../Context/LoadingContext";

export const ProductReview = ({ closeModal, productId, invoiceId }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewMessage, setReviewMessage] = useState("");
    const [reviewErrors, setReviewErrors] = useState({});
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [successMsg, setSuccessMsg] = useState(null);
    const [reviewSubmitted, setReviewSubmitted] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [customerEmail, setCustomerEmail] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { setLoading } = useLoading();

    useEffect(() => {
        const authStatus = sessionStorage.getItem("isAuthenticated") === "true";
        setIsAuthenticated(authStatus);

        if (authStatus) {
            const email = sessionStorage.getItem("customerEmail");
            if (email) {
                setCustomerEmail(email);
            } else {
                alert("Customer email not found.");
            }
        } else {
            alert("Customer is not authenticated.");
        }
    });

    const handleReviewInput = (e) => {
        const value = e.target.value;
        setReviewMessage(value);

        if (value.length === 0) {
            setReviewErrors({ reviewMessage: "Review message is required" });
            setButtonDisabled(true);
        } else if (value.length > 300) {
            setReviewErrors({ reviewMessage: "Review cannot exceed 300 characters" });
            setButtonDisabled(true);
        } else {
            setReviewErrors({ reviewMessage: "" });
            if (rating > 0) setButtonDisabled(false);
        }
    };

    const handleStarClick = (value) => {
        setRating(value);
        if (reviewMessage.length > 0) setButtonDisabled(false);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setHasSubmitted(true);

        if (rating === 0 || reviewMessage.trim() === "") {
            return; // Don't proceed if rating or review message is not filled
        }

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:9000/add-product-review", {
                productId: productId,
                customerEmail: customerEmail,
                invoiceId: invoiceId,
                rating : rating,
                review: reviewMessage,
            });

            if (response.status === 200) {
                setReviewSubmitted(true);
                setSuccessMsg("✅ Review submitted successfully!");
                setTimeout(() => {
                    closeModal();
                }, 2000);
            }
        } catch (error) {
            if(error.response.status === 400) {
                setReviewSubmitted(false);
                console.error("Error submitting review:", error);
            }
            setReviewSubmitted(false);
            console.error("Error submitting review:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-container">
                <div className="review-modal-header">
                    <h2>Submit Product Review</h2>
                    <button className="review-close-btn" onClick={closeModal}>×</button>
                </div>
                <form onSubmit={submitReview}>
                    <div className="review-form-group">
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "15px" }}>
                            <label>Rating <span className="review-required">*</span></label>
                            <div className="star-rating-container">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        style={{ fontSize: "30px" }}
                                        className={`star-icon ${star <= (hoverRating || rating) ? "filled" : ""}`}
                                        onClick={() => handleStarClick(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        {hasSubmitted && rating === 0 && (
                            <span className="review-error-text">Please select a rating.</span>
                        )}
                    </div>
                    <div className="review-form-group">
                        <label>Review Message <span className="review-required">*(Max 300 characters)</span></label>
                        <textarea
                            value={reviewMessage}
                            onChange={handleReviewInput}
                            placeholder="Write your review here"
                            maxLength={300}
                            required
                        />
                        {hasSubmitted && reviewErrors.reviewMessage && (
                            <span className="review-error-text">{reviewErrors.reviewMessage}</span>
                        )}
                    </div>
                    <button type="submit" disabled={buttonDisabled} className="review-submit-btn">
                        Submit Review
                    </button>
                    {reviewSubmitted === true && <p className="success-message">{successMsg}</p>}
                    {reviewSubmitted === false && (
                        <p className="error-message">❌ Failed to submit review. Try again.</p>
                    )}
                </form>
            </div>
        </div>
    );
};
