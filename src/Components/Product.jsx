import { React, useState, useEffect } from 'react';
import './Product.css';
import products from './Products';
import { useParams } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdRemoveShoppingCart } from "react-icons/md";
import { BsTag } from "react-icons/bs";
import { MdVerified } from "react-icons/md";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();
    const [likedProducts, setLikedProducts] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartBtnClicked, setCartBtnClicked] = useState(false);
    const [relatedCategories, setRelatedCategories] = useState([]);

    const vegetableAndFruits = products[0]["Vegetables & Fruits"];
    const productList = [];
    for (const category in vegetableAndFruits) {
        for (const item in vegetableAndFruits[category]) {
            const product = vegetableAndFruits[category][item];
            for (const size in product.category) {
                productList.push({
                    id: product.category[size].id,
                    name: item,
                    size: size,
                    image: product.image,
                    discount: product.category[size].discount,
                    rating: product.category[size].rating,
                    totalRaters: product.category[size]["total raters"],
                    price: product.category[size].price,
                    available: product.category[size].available,
                    isNew: product.category[size].new,
                    highlights: product.Highlights,
                    quickOverview: product["Quick OverView"],
                    parentCategory: category,
                });
            }
        }
    }

    useEffect(() => {
        const id = parseInt(productId, 10);
        const foundProduct = productList.find((product) => product.id === id);
        if (!foundProduct) {
            navigate('/ecommerce/404');
        } else {
            setProduct(foundProduct);
        }

        const related = productList.filter(
            (item) => item.name === foundProduct.name && item.parentCategory === foundProduct.parentCategory
        );
        setRelatedCategories(related);
    }, []);

    if (!product) {
        return (
            <div className='product-page'>
                <section className='product-navigate-section'>
                    <span className='navigate'>
                        <a onClick={() => navigate('/ecommerce/')}>
                            <b><IoMdHome /> Home</b>
                        </a>
                        <span>Loading...</span>
                    </span>
                </section>
                <p>Loading product details...</p>
            </div>
        );
    }

    const greater = '>';
    return (
        <div className='product-page'>
            <section className='product-navigate-section'>
                <span className='navigate'>
                    <a onClick={() => navigate('/ecommerce/')}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    {greater}
                    <a href=''>{product.parentCategory}</a>
                </span>
            </section>
            <section className='product-content-section'>
                <div className='product-content-image-section'>
                    <div className='product-content-image-section'>
                        <img src={product.image} alt={product.name} />
                        <span className='product-content-likebtn' onClick={() => setLikedProducts(!likedProducts)}>
                            {likedProducts ? <FaHeart color='red' /> : <FaHeart color='grey' />}
                        </span>
                    </div>
                </div>
                <div className='product-content-details-section'>
                    <div className='product-content-details-header'>
                        <div className='product-content-discount'>
                            {product.discount > 0 && (
                                <span>{product.discount}% OFF</span>
                            )}
                        </div>
                        <div className='product-content-rating'>
                            {product.rating > 0 ? (
                                <>
                                    <div className='product-content-rating-avg'>
                                        <span className='product-content-rating'>
                                            {product.rating} <MdOutlineStarPurple500 color='gold' />
                                        </span>
                                    </div>
                                    <div className='product-content-rating-total'>
                                        <p>{product.totalRaters} Rating</p>
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
                                <MdVerified />{product.parentCategory}
                            </strong>
                        </span>
                    </div>
                    <div className='product-content-price'>
                        {product.discount > 0 && (
                            <span className='product-content-regular-price'>
                                <BsTag /> Price  :  ₹ {product.price.toFixed(2)}
                            </span>
                        )}
                        <div className='product-content-discount-price'>
                            <span className='discount'>Discount Price : </span>
                            <p>
                                <strong className='price'>
                                    ₹
                                    {(
                                        product.price -
                                        (product.price * product.discount) / 100
                                    ).toFixed(2)}
                                </strong>
                            </p>
                        </div>
                    </div>
                    <div className="product-content-category-options">
                        {relatedCategories.map((category) => (
                            <div
                                key={category.id}
                                className={
                                    category.id === product.id
                                        ? "selected-category-option-container"
                                        : "category-option-container"
                                }
                                onClick={() => setProduct(category)}
                            >
                                <div className="radio-button-section">
                                    <input
                                        type="radio"
                                        name="category-option"
                                        id={`category-${category.id}`}
                                        checked={category.id === product.id}
                                        onChange={() => setProduct(category)}
                                    />
                                    <label htmlFor={`category-${category.id}`} className="category-size">
                                        {category.size}
                                    </label>
                                    <label htmlFor={`category-${category.id}`} className="category-price">
                                        <span className='category-discount-price'>
                                            <p>
                                                ₹{(
                                                    category.price -
                                                    (category.price * category.discount) / 100
                                                ).toFixed(2)}
                                            </p>
                                        </span>
                                        <span className='category-regular-price'>
                                            <p>₹{category.price.toFixed(2)}</p>
                                        </span>
                                    </label>
                                </div>
                                {category.id === product.id && category.discount > 0 && (
                                    <div className="discount-section-main">
                                        <span>{category.discount}% OFF</span>
                                    </div>
                                )}
                            </div>
                        ))}
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
                            {product.available > 0 ? (
                                <button
                                    className='product-content-add-to-cart'
                                    onClick={() => {
                                        setCartCount(1);
                                        setCartBtnClicked(true);
                                    }}
                                >
                                    <MdOutlineShoppingCart /> ADD TO CART
                                </button>
                            ) : (
                                <button className='product-content-out-of-stock'>
                                    <MdRemoveShoppingCart /> OUT OF STOCK
                                </button>
                            )}
                        </>
                    )}
                    <div className='product-content-highlights'>
                        <h1 className='highlights-title'>Highlights</h1>
                        <p className='highlights-text'>{product.highlights}</p>
                    </div>
                </div>
            </section>
            <section className='product-overview-section'>
                <h1>Quick Overview</h1>
                <p>{product.quickOverview}</p>
            </section>
        </div>
    );
}
