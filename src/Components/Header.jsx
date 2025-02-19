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
import { useLoading } from '../Context/LoadingContext';
import companyLogo from '../assets/Logo/060622034612bits.png';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Header = () => {
    const [showModal, setShowModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerDetails, setCustomerDetails] = useState({});
    const { setLoading } = useLoading();
    const navigate = useNavigate();

    const fetchCustomerDetails = async () => {
        if (isAuthenticated && customerEmail) {
            try {
                setLoading(true);
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
            } finally {
                setLoading(false);
            }
        }
    };

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

    }, []);

    useEffect(() => {
        if (isAuthenticated && customerEmail) {
            fetchCustomerDetails();
        }
    }, [isAuthenticated, customerEmail]);

    useEffect(() => {
        sessionStorage.setItem("cartCount", cartCount.toString());
    }, [cartCount]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [setLoading]);

    const handleSearchClick = () => {
        alert("Search Button Clicked");
    };

    const handleCart = () => {
        if (!isAuthenticated) {
            setShowModal(true);
            return;
        }
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

    const logoutAlert = async () => {
        return await Swal.fire({
            title: "Are you sure you want to Logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "green",
            cancelButtonColor: "red",
        });
    };

    const handleLogout = async () => {
        const result = await logoutAlert();
        if (result.isConfirmed) {
            sessionStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("customerEmail");
            sessionStorage.removeItem("cartCount");
            sessionStorage.removeItem("customerData");
            setIsAuthenticated(false);
            setCustomerEmail("");
            setCartCount(0);
            await Swal.fire("Logged Out!", "You have been logged out.", "success");
            navigate("/ecommerce/");
            window.location.reload();
        }
    };

    return (
        <>
            <header className="fixed-header">
                <div className="navbar">
                    <div className="navbar-container">
                        <div className="navbar-left">
                            <img
                                src={companyLogo}
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
                            <div className="icon-container"
                                onClick={() => {
                                    navigate("/ecommerce/my-profile");
                                    window.location.reload();
                                }}
                            >
                                <AccountCircleIcon style={{ color: "#133365" }} />
                                <span
                                    style={{ color: "#133365" }}
                                ><b>Hi</b> {customerDetails.customerName || 'Loading...'}</span>
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
                        {isAuthenticated ? (
                            <li onClick={handleLogout}><Link to={"/ecommerce"}>Logout</Link></li>
                        ) : null}
                    </ul>
                </div>

                {showModal && <LoginSignUpModal closeModal={closeModal} flag={1} />}
            </header>
        </>
    );
};
