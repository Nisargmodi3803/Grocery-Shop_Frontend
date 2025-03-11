import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiFileSearchFill } from "react-icons/ri";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import { LoginSignUpModal } from './LoginSignUpModal';
import "./Header.css";
import axios from 'axios';
import { useLoading } from '../Context/LoadingContext';
import Swal from 'sweetalert2';
import companyLogo from '../assets/Logo/060622034612bits.png';

export const Header = () => {
    const [showModal, setShowModal] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerDetails, setCustomerDetails] = useState({});
    const { setLoading } = useLoading();
    const navigate = useNavigate();
    const [noResult, setNoResult] = useState(false);
    const [searchResult, setSearchResult] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const searchRef = useRef(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResult(false);
            }
        };

        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, []);

    const fetchCustomerDetails = async () => {
        if (isAuthenticated && customerEmail) {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:9000/customer-email/${customerEmail}`);
                if (response.status === 200) {
                    setCustomerDetails(response.data);
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

        if (storedAuth === "true" && storedCustomerEmail) {
            setIsAuthenticated(true);
            setCustomerEmail(storedCustomerEmail);
        }

        if (storedCartCount) {
            setCartCount(parseInt(storedCartCount, 10));
        }
    },);

    useEffect(() => {
        if (isAuthenticated && customerEmail) {
            fetchCustomerDetails();
        }
    }, [isAuthenticated, customerEmail]);

    useEffect(() => {
        const updateCartCount = () => {
            const storedCartCount = sessionStorage.getItem("cartCount");
            setCartCount(storedCartCount ? parseInt(storedCartCount, 10) : 0);
        };

        window.addEventListener("cartUpdated", updateCartCount);
        updateCartCount();

        return () => {
            window.removeEventListener("cartUpdated", updateCartCount);
        };
    }, []);

    const updateCart = (newCount) => {
        sessionStorage.setItem("cartCount", newCount);
        setCartCount(newCount);
        window.dispatchEvent(new Event("cartUpdated"));
    };

    const handleCart = () => {
        if (!isAuthenticated) {
            setShowModal(true);
            return;
        }

        if (cartCount === 0) {
            // window.location.reload();
            return;
        }

        navigate('/ecommerce/checkout');
        // window.location.reload();
    };

    const handleLoginSignUp = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Are you sure you want to Logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "green",
            cancelButtonColor: "red",
        });

        if (result.isConfirmed) {
            sessionStorage.clear();
            setIsAuthenticated(false);
            setCustomerEmail("");
            setCartCount(0);
            window.dispatchEvent(new Event("cartUpdated"));
            await Swal.fire("Logged Out!", "You have been logged out.", "success");
            navigate("/ecommerce/");
            // window.location.reload();
        }
    };

    const fetchResults = async (query) => {
        try {
            const response = await axios.get(`http://localhost:9000/search?query=${encodeURIComponent(query)}`);
            if (response.status === 200) {
                if (response.data.length === 0) {
                    setNoResult(true);
                    return;
                }
                setSearchResult(response.data);
                setNoResult(false);
                setShowResult(true);
            }
        } catch (error) {
            if (error.response.status === 404) {
                setNoResult(true);
            } else {
                console.error("Error fetching search results:", error);
                setNoResult(true);
                alert("Error fetching search results. Please try again later.");
            }
        }
    }


    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === "") {
            setShowResult(false);
            setSearchQuery("");
            return;
        }

        fetchResults(query);
    }

    const handleFocus = () => {
        if (searchQuery.trim() !== "") {
            setShowResult(true);
        }
    }

    return (
        <>
            <header className="fixed-header">
                <div className="navbar">
                    <div className="navbar-container">
                        <div className="navbar-left"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate('/ecommerce/')}>
                            <img
                                src={companyLogo}
                                alt="Company Logo"
                                title="Bits Infotech"
                                className="company-logo"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    <div className="navbar-center" ref={searchRef}>
                        <div className="search-container">
                            <SearchIcon className="search-icon" />
                            <input
                                type="text"
                                className="search-bar"
                                placeholder="Search for Products"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={handleFocus}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        navigate(`/ecommerce/search-result/${searchQuery}`);
                                        setShowResult(false);
                                        setSearchQuery('');
                                    }
                                }}
                            />
                        </div>
                        <div className="search-button" onClick={() => {
                            navigate(`/ecommerce/search-result/${searchQuery}`);
                            setShowResult(false);
                            setSearchQuery('');
                        }}>
                            <RiFileSearchFill />
                            <span>SEARCH</span>
                        </div>
                        {showResult && (
                            <div className="search-results">
                                {noResult ? (
                                    <div className="no-result">NO RESULTS FOUND</div>
                                ) : (
                                    searchResult.map((product) => (
                                        <div
                                            className='search-item'
                                            key={product.id}
                                            onClick={() => {
                                                navigate(`/ecommerce/product/${product.slug_title}`);
                                                setShowResult(false);
                                                setSearchQuery('');
                                            }}>
                                            {product.name}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
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
                                    // window.location.reload();
                                }}
                            >
                                <AccountCircleIcon style={{ color: "#133365" }} />
                                <span style={{ color: "#133365" }}>
                                    <b>Hi</b> {customerDetails.customerName || 'Loading...'}
                                </span>
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
