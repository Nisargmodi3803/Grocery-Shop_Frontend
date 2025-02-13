import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiFileSearchFill } from "react-icons/ri";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import { LoginSignUpModal } from './LoginSignUpModal';
import "./Header.css";
import axios from 'axios';

export const Header = () => {
    const [showModal, setShowModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerDetails, setCustomerDetails] = useState({});
    // Function to fetch customer details from the backend
    const fetchCustomerDetails = async () => {
        if (isAuthenticated && customerEmail) {
            try {
                const response = await axios.get(`http://localhost:9000/customer-email/${customerEmail}`);
                if (response.status === 200) {
                    setCustomerDetails(response.data);
                    console.log("Customer Name: ", response.data.customerName); 
                    console.log("Customer Email: ", response.data.customerEmail);
                } else {
                    console.log("Error fetching customer details");
                }
            } catch (error) {
                console.error("Error fetching customer details:", error);
            }
        }
    };

    // Load authentication data and cart data from sessionStorage on mount
    useEffect(() => {
        const storedAuth = sessionStorage.getItem("isAuthenticated");
        const storedCustomerEmail = sessionStorage.getItem("customerEmail");
        const storedCartCount = sessionStorage.getItem("cartCount");

        if (storedAuth === "true" && storedCustomerEmail != null) {
            setIsAuthenticated(true);
            setCustomerEmail(storedCustomerEmail);
        }

        if (storedCartCount) {
            setCartCount(parseInt(storedCartCount, 10)); // Set cart count from sessionStorage
        }

        console.log("Email : " + storedCustomerEmail);

    }, []); // Only run on mount

    // Fetch customer details whenever `customerEmail` or `isAuthenticated` changes
    useEffect(() => {
        if (isAuthenticated && customerEmail) {
            fetchCustomerDetails();
        }
    }, [isAuthenticated, customerEmail]); // Trigger fetch when authentication or email changes

    // Save cart count in sessionStorage
    useEffect(() => {
        sessionStorage.setItem("cartCount", cartCount.toString());
    }, [cartCount]);

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
        if (cartCount > 0) setCartCount(cartCount - 1);
    };

    const handleLogout = () => {
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("customerEmail");
        sessionStorage.removeItem("cartCount");
        sessionStorage.removeItem("customerData");
        setIsAuthenticated(false);
        setCustomerEmail("");
        setCartCount(0);
        window.location.reload();
    };

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
                                loading="lazy"
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
                            <div className="icon-container">
                                <AccountCircleIcon />
                                <span><b>Hi</b> {customerDetails.customerName || 'Loading...'}</span>
                                <button onClick={handleLogout} className="logout-button">Logout</button>
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
                            <Link to={"/ecommerce"}><b>Home</b></Link>
                        </li>
                        <li><Link to={"/ecommerce/shop-by-category"}>Shop By Category</Link></li>
                        <li><Link to={"/ecommerce/blog"}>Blog</Link></li>
                        <li><Link to={"/ecommerce/about-us"}>About Us</Link></li>
                        <li><Link to={"/ecommerce/contact-us"}>Contact Us</Link></li>
                    </ul>
                </div>

                {showModal && <LoginSignUpModal closeModal={closeModal} flag={1}/>}
            </header>
        </>
    );
};
