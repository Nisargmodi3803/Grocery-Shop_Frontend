import { React, useState, useEffect } from 'react';
import './Product.css';
import { useParams } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdRemoveShoppingCart } from "react-icons/md";
import { BsTag } from "react-icons/bs";
import { MdVerified } from "react-icons/md";
import axios from 'axios';
import DOMPurify from 'dompurify';
import { MdAccessTime } from "react-icons/md";
import { MdOutlineChatBubbleOutline } from "react-icons/md";
import { LoginSignUpModal } from './LoginSignUpModal';
import { InquiryNow } from './InquiryNow';

export default function Product() {
    const [product, setProduct] = useState(null);
    const [likedProduct, setLikedProduct] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartBtnClicked, setCartBtnClicked] = useState(false);
    const [relatedCategories, setRelatedCategories] = useState([]);
    const { productSlugTitle } = useParams();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [inquiryProductId, setInquiryProductId] = useState(null);
    const [inquiryProductSlugTitle, setInquiryProductSlugTitle] = useState(null);
    const greater = '>';

    useEffect(() => {
        const authStatus = sessionStorage.getItem("isAuthenticated") === "true";
        setIsAuthenticated(authStatus);
    }, []);

    const importAll = (r) => {
        let images = {};
        r.keys().forEach((item) => {
            images[item.replace("./", "")] = r(item);
        });
        return images;
    };

    const imageMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log("Fetching product:", productSlugTitle);
                const response = await axios.get(`http://localhost:9000/product-title/${productSlugTitle}`);
                if (response.status === 200) {
                    setProduct(response.data);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log("No Product Found");
                    alert("No Product Found");
                } else {
                    console.error("Error fetching product:", error);
                    alert("Something went wrong. Please try again!");
                }
            }
        };
        fetchProduct();
    }, [productSlugTitle]);


    // Fetch Related Variants
    useEffect(() => {
        if (!product) return;

        const fetchRelatedCategories = async () => {
            try {
                const response = await axios.get(`http://localhost:9000/product-variants?name=${product.name}`);
                if (response.status === 200) {
                    const variants = response.data;
                    setRelatedCategories(variants);
                }
            } catch (error) {
                console.error("Error fetching related categories:", error);
            }
        };
        fetchRelatedCategories();
    }, [product]);

    const handleInquiryClick = (productId) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            setInquiryProductSlugTitle(productSlugTitle);
            return;
        }

        setInquiryProductId(productId);
        setShowModal(true); // Open Modal

    };

    const closeModal = () => {
        setShowModal(false);
        setInquiryProductId(null);
        setInquiryProductSlugTitle(null);
    };

    if (!product) {
        return (
            <div className='product-page'>
                <section className='product-navigate-section'>
                <span className='navigate'>
                    <a onClick={() => navigate('/ecommerce/')}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    <span> {greater} </span>
                    <a href=''>Loading...</a>
                    <span> {greater} </span>
                    <a href=''>Loading...</a>
                </span>
            </section>
                <h1 style={{ color: "#133365" }}>No Products Found...</h1>
            </div>
        );
    }
    // Image Handling
    const imageSrc = imageMap[product.image_url] || imageMap["default.jpg"];

    // Discount Calculation
    const calculateDiscountPercentage = (mrp, discountAmt) => {
        return mrp > 0 ? Math.round(((mrp - discountAmt) * 100) / mrp) : 0;
    };
    const discount = calculateDiscountPercentage(product.mrp, product.discount_amt);

    // Rating Handling
    const rating = product.average_rating ? parseFloat(product.average_rating).toFixed(1) : 0;
    const noOfRatings = product.no_of_rating || 0;

    return (
        <div className='product-page'>
            <section className='product-navigate-section'>
                <span className='navigate'>
                    <a onClick={() => navigate('/ecommerce/')}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    <span> {greater} </span>
                    <a href=''>{product.cat?.name || "Category"}</a>
                    <span> {greater} </span>
                    <a href=''>{product.subcat?.name || "Subcategory"}</a>
                </span>
            </section>

            <section className='product-content-section'>
                <div className='product-content-image-section'>
                    <img src={imageSrc} alt={product.name} loading='lazy' />
                    <span className='product-content-likebtn' onClick={() => setLikedProduct(!likedProduct)}>
                        {likedProduct ? <FaHeart color='red' /> : <FaHeart color='grey' />}
                    </span>
                </div>

                <div className='product-content-details-section'>
                    <div className='product-content-details-header'>
                        {discount > 0 && <span className='product-content-discount'>{discount}% OFF</span>}
                        <div className='product-content-rating'>
                            {rating > 0 ? (
                                <>
                                    <div className='product-content-rating-avg'>
                                        <span className='product-content-rating'>
                                            {rating} <MdOutlineStarPurple500 color='gold' />
                                        </span>
                                    </div>
                                    <div className='product-content-rating-total'>
                                        <p>{noOfRatings} Ratings</p>
                                    </div>
                                </>
                            ) : (
                                <div className='product-content-no-rating'>
                                    <p>No Rating Yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='product-content-name'>
                        <p>{product.name}</p>
                    </div>

                    <div className='product-content-category'>
                        <span>
                            <strong>
                                <MdVerified /> {product.subcat.name}
                            </strong>
                        </span>
                    </div>
                    <div className='product-content-price'>
                        {discount > 0 && (
                            <span className='product-content-regular-price'>
                                <BsTag /> Price: ₹{product.mrp.toFixed(2)}
                            </span>
                        )}
                        <div className='product-content-discount-price'>
                            <span className='discount'>Discount Price:</span>
                            <p>
                                <strong className='price'>₹{product.discount_amt.toFixed(2)}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="product-content-category-options">
                        {relatedCategories.map((category) => {
                            const isSelected = category.id === product.id;
                            const discountPercentage = category.mrp > 0 ? Math.round(((category.mrp - category.discount_amt) / category.mrp) * 100) : 0;

                            return (
                                <div
                                    key={category.id}
                                    className={isSelected ? "selected-category-option-container" : "category-option-container"}
                                    onChange={(e) => { navigate(`/ecommerce/product/${category.slug_title}`); window.location.reload(); }}
                                >
                                    <div className="radio-button-section"
                                        onChange={(e) => { navigate(`/ecommerce/product/${category.slug_title}`); window.location.reload(); }}>
                                        <input
                                            type="radio"
                                            name="category-option"
                                            id={`category-${category.id}`}
                                            checked={isSelected}
                                            onChange={(e) => { navigate(`/ecommerce/product/${category.slug_title}`); window.location.reload(); }}
                                        />
                                        <label htmlFor={`category-${category.id}`} className="category-size">
                                            {category.variantName}
                                        </label>

                                        <div htmlFor={`category-${category.id}`} className="category-price">
                                            <span className='category-regular-price'>
                                                <p>₹{category.mrp.toFixed(2)}</p>
                                            </span>
                                            <span className='category-discount-price'>
                                                <p>₹{category.discount_amt.toFixed(2)}</p>
                                            </span>
                                        </div>
                                    </div>

                                    {isSelected && discountPercentage > 0 && (
                                        <div className="discount-section-main">
                                            <span>{discountPercentage}% OFF</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>



                    {cartBtnClicked ? (
                        <div className='product-content-add-to-cart-quantity'>
                            <button
                                onClick={() => {
                                    if (cartCount > 1) {
                                        setCartCount(cartCount - 1);
                                    } else {
                                        setCartCount(0);
                                        setCartBtnClicked(false);
                                    }
                                }}
                            >
                                -
                            </button>
                            <span>{cartCount}</span>
                            <button onClick={() => setCartCount(cartCount + 1)}>
                                +
                            </button>
                        </div>
                    ) : (
                        <>
                            {product.productIsActive === 1 ? (
                                <button
                                    className='product-content-add-to-cart'
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            setShowLoginModal(true);
                                            return;
                                        }
                                        setCartCount(1);
                                        setCartBtnClicked(true);
                                    }}
                                >
                                    <MdOutlineShoppingCart /> ADD TO CART
                                </button>
                            ) : product.productIsActive === 2 ? (
                                <button className='product-content-out-of-stock'>
                                    <MdRemoveShoppingCart /> OUT OF STOCK
                                </button>
                            ) : product.productIsActive === 3 ? (
                                <button className='product-content-coming-soon'>
                                    <MdAccessTime /> COMING SOON
                                </button>
                            ) : product.productIsActive === 4 ? (
                                <button className='product-content-inquiry-now'
                                    onClick={() => handleInquiryClick(product.id)}>
                                    <MdOutlineChatBubbleOutline /> INQUIRY NOW
                                </button>
                            ) : null}
                        </>
                    )}
                    <div className='product-content-highlights'>
                        <h1 className='highlights-title'>Highlights</h1>
                        <p className='highlights-text'>{product.description}</p>
                    </div>
                </div>
            </section>
            <section className='product-overview-section'>
                <h1>Quick Overview</h1>
                <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.long_description) }}></p>
            </section>
            {showLoginModal && <LoginSignUpModal closeModal={() => setShowLoginModal(false)} flag={2} productSlugTitle={inquiryProductSlugTitle} />}
            {showModal && <InquiryNow closeModal={closeModal} productId={inquiryProductId} flag={2} />}
        </div>

    );
}
