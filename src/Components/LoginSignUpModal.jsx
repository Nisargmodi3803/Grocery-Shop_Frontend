import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { MdLock } from "react-icons/md";
import { BiSolidPencil } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
import axios, { HttpStatusCode } from 'axios';
import { useNavigate } from 'react-router-dom';
import "./LoginSignUpModal.css";
import { useLoading } from '../Context/LoadingContext';


export const LoginSignUpModal = ({ closeModal, productSlugTitle, brandSlugTitle, subcategorySlugTitle }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [OTP, setOTP] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState();
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: '', // Optional
    });
    const [forgotPasswordData, setForgotPasswordData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loginWithOTPData, setLoginWithOTPData] = useState({
        email: ''
    })
    const [errors, setErrors] = useState({});
    const [emailErrors, setEmailErrors] = useState({});
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [otpSent, setOtpSent] = useState();
    const [verified, setVerified] = useState(false);
    const [otpResponse, setOtpResponse] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [loginWithOTP, setLoginWithOTP] = useState(false);
    const [SuccessfulForgotPassword, setSuccessfulForgotPassword] = useState();
    const [inquiryProductSlugTitle, setInquiryProductSlugTitle] = useState(productSlugTitle);
    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { setLoading } = useLoading();

    // useEffect(() => {
    //     setLoading(true);
    //     const timer = setTimeout(() => setLoading(false), 1000);

    //     return () => clearTimeout(timer);
    // }, [setLoading]);

    useEffect(() => {
        const storedAuth = sessionStorage.getItem("isAuthenticated");
        if (storedAuth === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        validateField(name, value);
    };

    const handleForgotPasswordChange = (e) => {
        const { name, value } = e.target;
        setForgotPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        // console.log(forgotPasswordData);
        validateForgotPassword(name, value);
    };

    const validateForgotPassword = (name, value) => {
        const validationErrors = { ...emailErrors };

        if (name === "password") {
            if (value.length < 4 || value.length > 15) {
                validationErrors.password = "Password must be between 4 to 15 characters";
            } else {
                delete validationErrors.password;
            }
            if (forgotPasswordData.confirmPassword && value !== forgotPasswordData.confirmPassword) {
                validationErrors.confirmPassword = "Passwords do not match";
            } else {
                delete validationErrors.confirmPassword;
            }
        }

        if (name === "confirmPassword") {
            if (value !== forgotPasswordData.password) {
                validationErrors.confirmPassword = "Passwords do not match";
            } else {
                delete validationErrors.confirmPassword;
            }
        }

        setErrors(validationErrors);
    }

    const handleForgotPasswordEmailChange = (e) => {
        const { name, value } = e.target;
        setForgotPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        validateEmailField(name, value);
    }

    const validateEmailField = (name, value) => {
        const validationErrors = { ...emailErrors };

        if (name === "email") {
            if (value.trim() === "") {
                validationErrors.email = "Email is required";
            } else if (!emailRegex.test(value)) {
                validationErrors.email = "Invalid Email";
            } else {
                delete validationErrors.email;
            }
        }

        setEmailErrors(validationErrors);
    };


    const handleLoginWithOTPChange = (e) => {
        const { name, value } = e.target;
        setLoginWithOTPData((prevData) => ({
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

    const switchToLogin = () => {
        setIsLogin(true);
        setForgotPassword(false);
        setLoginWithOTP(false);
    };

    const switchToRegister = () => {
        setIsLogin(false);
        setForgotPassword(false);
        setLoginWithOTP(false);
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:9000/login', {
                email: formData.email,
                password: formData.password,
            });

            if (response.status == 200) {
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("customerEmail", formData.email);
                setIsAuthenticated(true);
                // console.log("Slug title : "+productSlugTitle);
                const timer = setTimeout(() => {
                    window.location.reload();
                    closeModal();
                }, 3000);
            }
            else {
                setIsAuthenticated(false);
            }

        } catch (error) {
            if (error.response.status === 400) {
                setIsAuthenticated(false);
            }
            else {
                console.error(error);
                alert('Login Failed');
            }
        }finally{
            setLoading(false);
        }
    };

    const handleRegistration = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:9000/register', {
                customerName: formData.name,
                customerMobile: formData.mobileNumber,
                customerEmail: formData.email,
                customerPassword: formData.password,
                otp: OTP,
                referralCode: formData.referralCode,
            });

            if (response.status === 200) {
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("customerEmail", formData.email);
                setIsAuthenticated(true);

                const timer = setTimeout(() => {
                    window.location.reload();
                    closeModal();
                    window.location.reload();
                }, 3000);
            }
            else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error(error);
            alert('Registration Failed');
        }finally{
            setLoading(false);
        }
    };


    const handleOTP = async () => {
        setLoading(true);
        if (isLogin) { // Login with OTP
            try {
                console.log(loginWithOTPData.email);
                const response = await axios.post('http://localhost:9000/send-email-login', {
                    email: loginWithOTPData.email
                })

                if (response.status === 200) {
                    setOtpSent(true);
                    setFormData({ ...formData, email: loginWithOTPData.email })
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 404) {
                        setOtpSent(false);
                    } else {
                        alert(`Error: ${error.response.status}`);
                    }
                } else {
                    console.error(error);
                    alert('OTP sending failed due to network or server error');
                }
            }finally{
                setLoading(false);
            }
        }
        else { // Registration with OTP
            setLoading(true);
            try {
                const response = await axios.post('http://localhost:9000/send-email-registration', {
                    email: formData.email,
                    name: formData.name
                });

                if (response.status === 200) {
                    setOtpSent(true);
                } else {
                    setOtpSent(false);
                    alert('Something went wrong. Please try again!');
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 409) {
                        setOtpSent(false);
                    } else {
                        alert(`Error: ${error.response.status}`);
                    }
                } else {
                    console.error(error);
                    alert('OTP sending failed due to network or server error');
                }
            }finally{
                setLoading(false);
            }

        }
    };

    // Forgot Password OTP
    const handleForgotPasswordOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:9000/send-email-forgot-password', {
                email: forgotPasswordData.email
            })
            if (response.status === 200) {
                setOtpSent(true);
                setFormData({ ...formData, email: forgotPasswordData.email });
            } else {
                setOtpSent(false);
                alert('Something went wrong. Please try again!');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 409) {
                    setOtpSent(false);
                } else {
                    alert(`Error: ${error.response.status}`);
                }
            } else {
                console.error(error);
                alert('OTP sending failed due to network or server error');
            }
        }finally{
            setLoading(false);
        }
    }

    const handleVerify = async () => {
        setLoading(true);
        try {
            console.log(OTP);
            const response = await axios.post('http://localhost:9000/verify-otp', {
                email: formData.email,
                otp: OTP
            });

            // If OTP is valid
            if (response.status === 200) {
                setVerified(true);
                setOtpResponse("✅ OTP is valid");
            }

        } catch (error) {
            if (error.response) {
                // Handle specific errors from the backend
                switch (error.response.status) {
                    case 400:
                        setOtpResponse("❌ Invalid OTP. Please try again.");
                        break;
                    case 404:
                        setOtpResponse("❌ OTP not found. Please request a new one.");
                        break;
                    case 409:
                        setOtpResponse("❌ OTP expired. Please request a new one.");
                        break;
                    default:
                        setOtpResponse(`Please Enter Valid OTP`);
                        break;
                }
            } else if (error.request) {
                // Request was made but no response received
                setOtpResponse("❌ No response from server. Please check your internet connection.");
            } else {
                // Other unexpected errors
                setOtpResponse(`❌ Unexpected Error: ${error.message}`);
            }
            setVerified(false);
        }finally{
            setLoading(false);
        }
    };

    const handleVerifyAndLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log(OTP);
            const response = await axios.post('http://localhost:9000/verify-otp', {
                email: formData.email,
                otp: OTP
            });

            // If OTP is valid
            if (response.status === 200) {
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("customerEmail", formData.email);
                setIsAuthenticated(true);
                setVerified(true);
                setOtpResponse("✅ OTP is valid");
                const timer = setTimeout(() => {
                    window.location.reload();
                    closeModal();
                }, 3000);
            }

        } catch (error) {
            if (error.response) {
                // Handle specific errors from the backend
                switch (error.response.status) {
                    case 400:
                        setOtpResponse("❌ Invalid OTP. Please try again.");
                        break;
                    case 404:
                        setOtpResponse("❌ OTP not found. Please request a new one.");
                        break;
                    case 409:
                        setOtpResponse("❌ OTP expired. Please request a new one.");
                        break;
                    default:
                        setOtpResponse(`Please Enter Valid OTP`);
                        break;
                }
            } else if (error.request) {
                // Request was made but no response received
                setOtpResponse("❌ No response from server. Please check your internet connection.");
            } else {
                // Other unexpected errors
                setOtpResponse(`❌ Unexpected Error: ${error.message}`);
            }
            setVerified(false);
        }finally{
            setLoading(false);
        }
    }

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.patch('http://localhost:9000/forgot-password', {
                email: forgotPasswordData.email,
                password: forgotPasswordData.password
            })

            if (response.status === 200) {
                setSuccessfulForgotPassword(true);
                const timer = setTimeout(() => {
                    window.location.reload();
                    setIsLogin(true);
                    setForgotPassword(false);
                }, 3000);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    setSuccessfulForgotPassword(false);
                }
            } else if (error.request) {
                setSuccessfulForgotPassword(false);
                console.error(error);
                alert('No Response from Server');
            } else {
                setSuccessfulForgotPassword(false);
                console.error(error);
                alert('Password Change Failed');
            }
        }finally{
            setLoading(false);
        }
    };


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
                        onClick={switchToLogin}
                    >
                        <MdLock />
                        LOGIN
                    </button>
                    <button
                        className={`tab-btn ${!isLogin ? 'active' : ''}`}
                        onClick={switchToRegister}
                    >
                        <BiSolidPencil />
                        FOR NEW USER
                    </button>
                </div>

                <div className="modal-body">
                    {forgotPassword ? (
                        <form onSubmit={handleForgotPasswordSubmit}>
                            <h2>Forgot Password</h2>
                            <label>Enter Email <span className="required">*</span></label>
                            <input
                                type='email'
                                name='email'
                                placeholder='Email'
                                required
                                onChange={handleForgotPasswordEmailChange}
                                value={forgotPasswordData.email}
                            // disabled={otpSent}
                            />
                            {emailErrors.email && <div className="error">{emailErrors.email}</div>}

                            {Object.keys(emailErrors).length === 0 && forgotPasswordData.email && (
                                <>
                                    {otpSent ? (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleForgotPasswordOTP}>
                                            ReSend OTP <FaArrowRight />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleForgotPasswordOTP}>
                                            Send OTP <FaArrowRight />
                                        </button>
                                    )}

                                    <input
                                        placeholder="Enter OTP"
                                        className="label-otp"
                                        value={OTP}
                                        onChange={(e) => setOTP(e.target.value)}
                                    />

                                    {otpSent && <span className="otp-success-message">✅ OTP Sent Successfully!</span>}

                                    {otpSent && (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleVerify}>
                                            Verify OTP
                                        </button>
                                    )}

                                    {verified === true && <span className="otp-success-message">{otpResponse}</span>}
                                    {verified === false && <span className="otp-error-message">{otpResponse}</span>}

                                    {/* Always show password fields once verified is true */}
                                    {verified === true && (
                                        <>
                                            <label>Enter New Password <span className="required">*</span></label>
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="New Password"
                                                required
                                                onChange={handleForgotPasswordChange}
                                                value={forgotPasswordData.password}
                                            />
                                            {errors.password && <div className="error">{errors.password}</div>}

                                            <label>Confirm New Password <span className="required">*</span></label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Confirm New Password"
                                                required
                                                onChange={handleForgotPasswordChange}
                                                value={forgotPasswordData.confirmPassword}
                                            />
                                            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}

                                            {/* Submit button should be disabled if required fields are missing */}
                                            {Object.keys(errors).length === 0 &&
                                                forgotPasswordData.email &&
                                                forgotPasswordData.password &&
                                                forgotPasswordData.confirmPassword && (
                                                    <button type="submit" className="btn btn-primary">
                                                        Change Password
                                                    </button>
                                                )}

                                            {SuccessfulForgotPassword === true ? (
                                                <span className="otp-success-message">✅ Password Changed Successfully!</span>
                                            ) : SuccessfulForgotPassword === false ? (
                                                <span className="otp-error-message">❌ Email not found!</span>
                                            ) : null}
                                        </>
                                    )}
                                </>
                            )}

                        </form>
                    ) : loginWithOTP ? (
                        <form onSubmit={handleVerifyAndLogin}>
                            <h2>Login to your account</h2>
                            <label>Enter Email <span className="required">*</span></label>
                            <input
                                type='email'
                                name='email'
                                placeholder='Email'
                                required
                                value={loginWithOTPData.email}
                                onChange={handleLoginWithOTPChange}
                                disabled={otpSent}
                            />
                            {errors.email && <div className="error">{errors.email}</div>}

                            {Object.keys(errors).length === 0 && loginWithOTPData.email && (
                                <>
                                    {otpSent == true ? (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleOTP}>
                                            ReSend OTP <FaArrowRight />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleOTP}>
                                            Send OTP <FaArrowRight />
                                        </button>
                                    )}

                                    <input
                                        placeholder='Enter OTP'
                                        className='label-otp'
                                        value={OTP}
                                        onChange={(e) => setOTP(e.target.value)}
                                    />
                                    {otpSent == true ? <span className="otp-success-message">✅ OTP Send Successfully to {loginWithOTPData.email}!</span> : otpSent == false ? <span className="otp-error-message">❌ Email not found. Please register or use a different email.</span> : ""}
                                    {otpSent && (
                                        <button
                                            type="submit"
                                            className="btn-otp">
                                            Verify OTP
                                        </button>
                                    )}
                                    {verified == true ?
                                        <span className="otp-success-message">{otpResponse}</span>
                                        : verified == false ? <span className="otp-error-message">{otpResponse}</span> : ""
                                    }
                                </>
                            )}
                        </form>
                    ) : isLogin ? (
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
                                disabled={otpSent}
                            />
                            {errors.email && <div className="error">{errors.email}</div>}

                            <label>Enter Password <span className="required">*</span></label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={otpSent}
                            />
                            <button type="submit" className="btn btn-primary">
                                Login
                            </button>
                            <div className="or-section">OR</div>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setLoginWithOTP(true)}>
                                Login With OTP
                            </button>
                            <a className="forgot-password"
                                onClick={() => setForgotPassword(true)}>
                                Forgot Your Password?
                            </a>
                            {isAuthenticated === true && Object.keys(errors).length === 0 && formData.email && formData.password ? (
                                <span className="otp-success-message">✅ Login Successful!</span>
                            ) : isAuthenticated === false ? (
                                <span className="otp-error-message">❌ Email or Password Incorrect</span>
                            ) : null}
                        </form>
                    ) : forgotPassword ? (
                        <form onSubmit={handleForgotPasswordSubmit}>
                            <h2>Forgot Password</h2>
                            <label>Enter Email <span className="required">*</span></label>
                            <input
                                type='email'
                                name='email'
                                placeholder='Email'
                                required
                                onChange={handleForgotPasswordEmailChange}
                                value={forgotPasswordData.email}
                            // disabled={otpSent}
                            />
                            {emailErrors.email && <div className="error">{emailErrors.email}</div>}

                            {Object.keys(emailErrors).length === 0 && forgotPasswordData.email && (
                                <>
                                    {otpSent ? (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleForgotPasswordOTP}>
                                            ReSend OTP <FaArrowRight />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleForgotPasswordOTP}>
                                            Send OTP <FaArrowRight />
                                        </button>
                                    )}

                                    <input
                                        placeholder="Enter OTP"
                                        className="label-otp"
                                        value={OTP}
                                        onChange={(e) => setOTP(e.target.value)}
                                    />

                                    {otpSent && <span className="otp-success-message">✅ OTP Sent Successfully!</span>}

                                    {otpSent && (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleVerify}>
                                            Verify OTP
                                        </button>
                                    )}

                                    {verified === true && <span className="otp-success-message">{otpResponse}</span>}
                                    {verified === false && <span className="otp-error-message">{otpResponse}</span>}

                                    {verified === true && (
                                        <>
                                            <label>Enter New Password <span className="required">*</span></label>
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="New Password"
                                                required
                                                onChange={handleForgotPasswordChange}
                                                value={forgotPasswordData.password}
                                            />
                                            {errors.password && <div className="error">{errors.password}</div>}

                                            <label>Confirm New Password <span className="required">*</span></label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                placeholder="Confirm New Password"
                                                required
                                                onChange={handleForgotPasswordChange}
                                                value={forgotPasswordData.confirmPassword}
                                            />
                                            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}

                                            {Object.keys(errors).length === 0 &&
                                                forgotPasswordData.email &&
                                                forgotPasswordData.password &&
                                                forgotPasswordData.confirmPassword && (
                                                    <button type="submit" className="btn btn-primary">
                                                        Change Password
                                                    </button>
                                                )}

                                            {SuccessfulForgotPassword === true ? (
                                                <span className="otp-success-message">✅ Password Changed Successfully!</span>
                                            ) : SuccessfulForgotPassword === false ? (
                                                <span className="otp-error-message">❌ Email not found!</span>
                                            ) : null}
                                        </>
                                    )}
                                </>
                            )}

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
                                disabled={otpSent}
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
                                disabled={otpSent}
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
                                disabled={otpSent}
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
                                disabled={otpSent}
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
                                disabled={otpSent}
                            />
                            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}

                            <label>Enter Referral Code <span className="required">(Optional)</span></label>
                            <input
                                type='text'
                                name='referralCode'
                                placeholder='Referral Code (Optional)'
                                value={formData.referralCode}
                                onChange={handleInputChange}
                                disabled={otpSent}
                            />
                            <label className="password-info">Please enter the referral code shared by your friend if available.</label>

                            {Object.keys(errors).length === 0 && formData.name && formData.mobileNumber && formData.password && formData.confirmPassword && formData.email && (
                                <>
                                    {otpSent == true ? (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleOTP}>
                                            ReSend OTP <FaArrowRight />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleOTP}>
                                            Send OTP <FaArrowRight />
                                        </button>
                                    )}
                                    <input
                                        placeholder='Enter OTP'
                                        className='label-otp'
                                        value={OTP}
                                        onChange={(e) => setOTP(e.target.value)}
                                    />
                                    {otpSent == true ? <span className="otp-success-message">✅ OTP Send Successfully!</span> : ""}
                                    {otpSent == false ? <span className="otp-error-message">❌ Email already registered. Please login or use a different email. </span> : ""}
                                    {otpSent && (
                                        <button
                                            type="button"
                                            className="btn-otp"
                                            onClick={handleVerify}>
                                            Verify OTP
                                        </button>
                                    )}
                                    {verified == true ?
                                        <span className="otp-success-message">{otpResponse}</span>
                                        : verified == false ? <span className="otp-error-message">{otpResponse}</span> : ""}
                                </>
                            )}
                            {verified && (
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setIsChecked(e.target.checked)}
                                    />
                                    <span>I agree to the Terms & Conditions</span>
                                </label>
                            )}

                            {verified && isChecked && (
                                <div className="text-center">
                                    <button type='submit' className="btn btn-primary">
                                        Create Your Account
                                    </button>
                                    {isAuthenticated === true && Object.keys(errors).length === 0 && formData.email && formData.password && formData.confirmPassword && formData.mobileNumber && OTP ? (
                                        <span className="otp-success-message">✅ Registration Successful!</span>
                                    ) : isAuthenticated === false ? (
                                        <span className="otp-error-message">❌ Email Already Exist!</span>
                                    ) : null}
                                </div>
                            )}
                            <a className="forgot-password"
                                onClick={() => setForgotPassword(true)}>
                                Forgot Your Password?
                            </a>
                        </form>

                    )}
                </div>
            </div>
        </div >
    );
};
