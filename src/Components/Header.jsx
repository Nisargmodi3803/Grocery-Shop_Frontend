import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiFileSearchFill } from "react-icons/ri";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import "./Header.css";
import { LoginSignUpModal } from './LoginSignUpModal';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const Header = () => {
    const [showModal, setShowModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [customerDetails,setCustomerDetails] = useState(null);

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            const authToken = Cookies.get('authToken');

            if (authToken) {
                setIsAuthenticated(true);
                try {
                    // Decode JWT to extract customerId & email
                    const decodedToken = jwtDecode(authToken);
                    const customerId = decodedToken.customerId;
                    const customerEmail = decodedToken.sub; // "sub" contains the email

                    console.log("Customer ID:", customerId);
                    console.log("Customer Email:", customerEmail);

                    // Fetch additional customer details from backend
                    const response = await axios.get(`http://localhost:9000/customer/${customerId}`);
                    setCustomerDetails(response.data);
                } catch (error) {
                    console.error("Error fetching customer details:", error);
                    setIsAuthenticated(false);
                    setCustomerDetails(null);
                }
            } else {
                setIsAuthenticated(false);
                setCustomerDetails(null);
            }
        };

        fetchCustomerDetails();
    }, [Cookies.get('authToken')]); // Run every time authToken changes


    const handleSearchClick = () => {
        alert("Search Button Clicked");
    };

    const handleCart = () => {
        alert("Cart Clicked");
    };

    const handleLoginSignUp = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const addToCart = () => {
        setCartCount(cartCount + 1);
    };

    const removeFromCart = () => {
        if (cartCount > 0)
            setCartCount(cartCount - 1);
        else
            setCartCount(0);
    }
    return (
        <>
            <header className="fixed-header">
                <div className="navbar">
                    <div className="navbar-container">
                        <div className="navbar-left">
                            <img
                                src="https://bitsinfotech.in/ecommerce/fmcg_upload/logo/060622034612bits.png"
                                alt="Company Logo"
                                title="Bits Infotech"
                                className="company-logo"
                                loading='lazy'
                            />
                        </div>
                    </div>

                    <div className="navbar-center">
                        <SearchIcon />
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Search for Products"
                        />
                        <div className="search-button" onClick={handleSearchClick}>
                            <RiFileSearchFill />
                            <span>SEARCH</span>
                        </div>
                    </div>

                    <div className="navbar-right">
                        {!isAuthenticated ? (
                            <div className="icon-container" onClick={handleLoginSignUp}>
                            <AccountCircleIcon />
                            <span>Login/Sign Up</span>
                        </div>
                        ) : (
                            <div className='icon-container'>
                            <AccountCircleIcon />
                            <span><b>Hi</b> ${customerDetails.customerName}</span>
                            </div>
                        )}
                        <div className="icon-container cart-icon-container" onClick={handleCart}>
                            <ShoppingCartRoundedIcon />
                            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                            <span>My Cart</span>
                        </div>
                    </div>
                </div>
                <div className="navbar-link">
                    <ul>
                        <li className="home-item">
                            <HomeIcon />
                            <Link to={"/ecommerce"}>
                                <b>Home</b>
                            </Link>
                        </li>
                        <li>
                            <Link to={"/ecommerce/shopbycategory"}>Shop By Category</Link>
                        </li>
                        <li>
                            <Link to={"/ecommerce/blog"}>Blog</Link>
                        </li>
                        <li>
                            <Link to={"/ecommerce/aboutus"}>About Us</Link>
                        </li>
                        <li>
                            <Link to={"/ecommerce/contactus"}>Contact Us</Link>
                        </li>
                    </ul>
                </div>
                {showModal && <LoginSignUpModal closeModal={closeModal} />}
                {/* <button onClick={addToCart}>Add Item to Cart</button>
            <button onClick={removeFromCart}>Remove Item from Cart</button> */}
            </header>
        </>

    );
};
