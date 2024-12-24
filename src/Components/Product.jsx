import { React, useState, useEffect } from 'react'
import './Product.css'
import products from './Products'
import { useParams } from 'react-router-dom'
import { IoMdHome } from "react-icons/io";
import { FaGreaterThan } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { MdOutlineStarPurple500 } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdRemoveShoppingCart } from "react-icons/md";

export default function Product() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();
    const [likedProducts, setLikedProducts] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartBtnClicked, setCartBtnClicked] = useState(false);

    const vegetableAndFruits = products[0]["Vegetables & Fruits"];
    const productList = [];
    for (const category in vegetableAndFruits) {
        for (const item in vegetableAndFruits[category]) {
            const product = vegetableAndFruits[category][item];
            for (const size in product.category) {
                productList.push({
                    id: product.category[size].id,
                    name: `${item} - ${size}`,
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
            console.error('Product not found');
        }
        setProduct(foundProduct);
    }, []);

    if (!product) {
        return (
            <div className='product-page'>
                <section className='product-navigate-section'>
                    <span className='navigate'>
                        <a onClick={() => { navigate('/ecommerce/') }}>
                            <b><IoMdHome /> Home</b>
                        </a>
                        <span>Loading...</span>
                    </span>
                </section>
                <p>Loading product details...</p>
            </div>
        );
    }

    return (
        <div className='product-page'>
            <section className='product-navigate-section'>
                <span className='navigate'>
                    <a href='' onClick={() => { navigate('/ecommerce/') }}>
                        <b><IoMdHome /> Home</b>
                    </a>
                    <FaGreaterThan />
                    <a href=''>{product.parentCategory}</a>
                </span>
            </section>
            <section className='product-content-section'>
                <div className='product-content-image-section'>
                    <img src={product.image} alt={product.name} />
                    <span className='product-content-likebtn' onClick={() => setLikedProducts(!likedProducts)}>
                        {likedProducts ? <FaHeart color='red' /> : <FaHeart color='grey' />}
                    </span>
                </div>
                <div className='product-content-details-section'>
                    <div className='product-content-discount'>
                        {product.discount > 0 && (
                            <span className='product-content-discount'>{product.discount}% OFF</span>
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
                            <p className='product-content-no-rating'>No Rating Yet</p>
                        )}
                    </div>
                    <div className='product-content-name'>
                        <h5>{product.name}</h5>
                    </div>
                    <div className='product-content-price'>
                        {product.discount > 0 && (
                            <span className='product-regular-price'>
                                ₹{product.price}
                            </span>
                        )}
                        <span className='product-content-discount-price'>
                            ₹
                            {(
                                product.price -
                                (product.price * product.discount) / 100
                            ).toFixed(2)}
                        </span>
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
                                    <MdOutlineShoppingCart /> Add To Cart
                                </button>
                            ) : (
                                <button className='product-content-out-of-stock'>
                                    <MdRemoveShoppingCart /> Out Of Stock
                                </button>
                            )}
                        </>
                    )}

                    <div className='product-content-highlights'>
                        <h1>Highlights</h1>
                        <p>{product.highlights}</p>
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
