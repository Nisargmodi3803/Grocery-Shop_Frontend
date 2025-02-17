import React, { useEffect, useState } from "react";
import "./InquiryNow.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../Context/LoadingContext";

export const InquiryNow = ({ closeModal, flag, productId, productSlugTitle, brandSlugTitle, subcategorySlugTitle }) => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setError] = useState({});
    const [buttonDisable, setButtonDisable] = useState(true);
    const [inquiryProductId, setInquiryProductId] = useState(productId);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [customerEmail, setCustomerEmail] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);

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
    }, []);

    const getProductId = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/product-title/${productSlugTitle}`);
            if (response.status === 200) {
                setInquiryProductId(response.data.id);
                return response.data.id; // Return product ID
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Product Found");
                alert("No Product Found");
            } else {
                alert("Something went wrong. Please try again!");
            }
        } finally {
            setLoading(false);
        }
        return null;
    };

    const submitInquiry = async (finalProductId) => {
        setLoading(true);
        if (!finalProductId) {
            alert("Invalid product ID");
            return;
        }
        try {
            const response = await axios.post("http://localhost:9000/product-inquiry", {
                productId: finalProductId,
                customerEmail: customerEmail,
                quantity: quantity,
                message: message
            });

            if (response.status === 200) {
                console.log("Inquiry submitted successfully");
                setIsSuccess(true);
                setSuccessMessage("✅ Inquiry submitted successfully");
                setTimeout(() => {
                    closeModal();
                    window.location.reload();
                }, 3000);
            }
        } catch (error) {
            console.error("Error submitting inquiry:", error);
            alert("Something went wrong. Please try again!");
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (flag === 2) {
            const fetchedProductId = await getProductId(); // Ensure this completes first
            submitInquiry(fetchedProductId);
        } else {
            submitInquiry(productId);
        }
    };

    const handleInput = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (value.length === 0) {
            setError({ message: "Message is required" });
            setButtonDisable(true);
        } else if (value.length > 250) {
            setError({ message: "Message cannot exceed 250 characters" });
            setButtonDisable(true);
        } else {
            setError({ message: "" });
            setButtonDisable(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [setLoading]);

    return (
        <div className="inquiry-modal-overlay">
            <div className="inquiry-modal-content">
                <div className="inquiry-modal-header">
                    <h2>Product Inquiry</h2>
                    <button className="close-button" onClick={closeModal}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Required Quantity <span className="required">*</span></label>
                        <input
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            placeholder="Enter required quantity"
                            value={quantity}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ""); // Only numbers
                                setQuantity(value);
                            }}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Message <span className="required">*(Maximum 250 characters)</span></label>
                        <textarea
                            placeholder="Enter message"
                            value={message}
                            onChange={handleInput}
                            maxLength={250}
                            required
                        />
                        {errors.message && <span className="error">{errors.message}</span>}
                    </div>
                    <button
                        type="submit"
                        disabled={buttonDisable}
                        className="submit-button"
                    >
                        Submit
                    </button>
                    {isSuccess === true ? (
                        <p className="success-message">{successMessage}</p>
                    ) : isSuccess === false ? (
                        <p className="error-message">❌ Something went wrong. Please try again!</p>
                    ) : null}
                </form>
            </div>
        </div>
    );
};
