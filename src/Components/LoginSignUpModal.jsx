import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { MdLock } from "react-icons/md";
import { BiSolidPencil } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import "./LoginSignUpModal.css";

export const LoginSignUpModal = ({ closeModal }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [OTP, setOTP] = useState('');
    const [response, setResponse] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: '', // Optional
    });
    const [errors, setErrors] = useState({});
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [verified, setVerified] = useState(false);
    // const [confirmationResult, setConfirmationResult] = useState(null); // Store the confirmationResult

    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        validateField(name, value);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin();
        } else {
            if (!verified) {
                alert("Please verify OTP before registration.");
                return;
            }
            handleRegistration();
        }
    };

    const handleLogin = () => {
        axios.post('http://localhost:9000/login', {
            email: formData.email,
            password: formData.password,
        }, { withCredentials: true }) // Ensure cookies are sent & received
            .then(response => {
                console.log(response.data);
                alert('Login Successful');

                // Redirect to home page after successful login
                navigate('/ecommerce');
            })
            .catch(error => {
                console.error(error);
                alert('Login Failed');
            });
    };

    const handleRegistration = () => {
        axios.post('http://localhost:9000/register', {
            customerName: formData.name,
            customerMobile: formData.mobileNumber,
            customerPassword: formData.password,
            otp: OTP,
            referralCode: formData.referralCode, // Optional
        }, { withCredentials: true }) // Ensure cookies are sent & received
            .then(response => {
                console.log(response.data);
                setVerified(false);
                alert('Registration Successful');

                // Read authToken from the cookie (auto-login)
                const authToken = Cookies.get('authToken');
                console.log("Auth Token:", authToken);
                if (authToken) {
                    // Redirect to home page after successful registration & login
                    navigate('/ecommerce');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Registration Failed');
            });
    };

    const handleOTP = () => {
        if (isLogin) { // Login with OTP
            axios.post('http://localhost:9000/send-otp-login', {
                email: formData.email
            })
                .then(response => {
                    console.log(response.data);
                    setOtpSent(true);
                    setResponse(response.data);
                })
                .catch(error => {
                    console.error(error);
                    alert('OTP sending failed');
                });
        }
        else { // Registration with OTP
            axios.post('http://localhost:9000/send-email-registration', {
                email: formData.email,
                name: formData.name
            })
                .then(response => {
                    console.log(response.data);
                    setOtpSent(true);
                    setResponse(response.data);
                })
                .catch(error => {
                    console.error(error);
                    alert('OTP sending failed');
                });
        }
    };

    const handleVerify = () => {
        axios.post('http://localhost:9000/verify-otp', {
            email: formData.email,
            otp: OTP
        })
            .then(response => {
                console.log(response.data);
                setVerified(true);
            })
            .catch(error => {
                console.error(error);
                alert('OTP verification failed');
            });
    }

    const validateField = (name, value) => {
        const validationErrors = { ...errors };

        if (name === "name") {
            if (value.trim() === "") validationErrors.name = "Name is required";
            else delete validationErrors.name;
        }

        if (name === "mobileNumber") {
            if (value.trim() === "") {
                validationErrors.mobileNumber = "Mobile Number is required";
            } else if (!mobileRegex.test(value)) {
                validationErrors.mobileNumber = "Invalid Mobile Number";
            } else {
                delete validationErrors.mobileNumber;
            }
        }

        if (name === "email") {
            if (value.trim() === "") {
                validationErrors.email = "Email is required";
            } else if (!emailRegex.test(value)) {
                validationErrors.email = "Invalid Email";
            } else {
                delete validationErrors.email;
            }
        }

        if (name === "password") {
            if (value.length < 4 || value.length > 15) {
                validationErrors.password = "Password must be between 4 to 15 characters";
            } else {
                delete validationErrors.password;
            }
            if (formData.confirmPassword && value !== formData.confirmPassword) {
                validationErrors.confirmPassword = "Passwords do not match";
            } else {
                delete validationErrors.confirmPassword;
            }
        }

        if (name === "confirmPassword") {
            if (value !== formData.password) {
                validationErrors.confirmPassword = "Passwords do not match";
            } else {
                delete validationErrors.confirmPassword;
            }
        }

        setErrors(validationErrors);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {isLogin ? <><IoCloseSharp className="custom-close-btn" onClick={closeModal} /></> : ""}

                <div className="modal-header">
                    <button
                        className={`tab-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        <MdLock />
                        LOGIN
                    </button>
                    <button
                        className={`tab-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        <BiSolidPencil />
                        FOR NEW USER
                    </button>
                </div>

                <div className="modal-body">
                    {isLogin ? (
                        <form onSubmit={handleSubmit}>
                            <h2>Login to your account</h2>
                            <label>Enter Email <span className="required">*</span></label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.mobileNumber && <div className="error">{errors.mobileNumber}</div>}

                            <label>Enter Password <span className="required">*</span></label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            <button type="submit" className="btn btn-primary">
                                Login
                            </button>
                            <div className="or-section">OR</div>
                            <button type="button" className="btn btn-secondary">
                                Login With OTP
                            </button>
                            <a href="#" className="forgot-password">
                                Forgot Your Password?
                            </a>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h2>Register Now!</h2>
                            <label>Your Name <span className="required">*</span></label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                            {errors.name && <div className="error">{errors.name}</div>}

                            <label>Your Mobile Number <span className="required">*</span></label>
                            <input
                                type="text"
                                name="mobileNumber"
                                placeholder="Mobile Number"
                                required
                                value={formData.mobileNumber}
                                onChange={handleInputChange}
                            />
                            {errors.mobileNumber && <div className="error">{errors.mobileNumber}</div>}

                            <label>Your Email <span className="required">*</span></label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && <div className="error">{errors.email}</div>}

                            <label>Create Password <span className="required">*</span></label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            {errors.password && <div className="error">{errors.password}</div>}
                            <label className="password-info">Password must be 4 to 15 characters</label>

                            <label>Confirm Password <span className="required">*</span></label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            <label>Enter Referral Code <span className="required">(Optional)</span></label>
                            <input
                                type='text'
                                name='referralCode'
                                placeholder='Referral Code (Optional)'
                                value={formData.referralCode}
                                onChange={handleInputChange}
                            />
                            <label className="password-info">Please enter the referral code shared by your friend if available.</label>
                            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}

                            {Object.keys(errors).length === 0 && formData.name && formData.mobileNumber && formData.password && formData.confirmPassword && formData.email && (
                                <>
                                    <button
                                        type="button"
                                        className="btn-otp"
                                        onClick={handleOTP}>
                                        Send OTP <FaArrowRight />
                                    </button>
                                    <input
                                        placeholder='Enter OTP'
                                        className='label-otp'
                                        value={OTP}
                                        onChange={(e) => setOTP(e.target.value)}
                                    />
                                    {otpSent && <span className="otp-success-message">✅ OTP Send Successfully!</span>}
                                    {otpSent && (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleVerify}>
                                            Verify OTP
                                        </button>
                                    )}
                                    {verified && <span className="otp-success-message">✅ OTP Verified!</span>}
                                </>
                            )}
                            {verified ? (
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary">
                                        Register
                                    </button>
                                </div>
                            ) : ""}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
