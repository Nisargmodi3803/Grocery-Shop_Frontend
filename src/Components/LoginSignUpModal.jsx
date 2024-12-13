import React, { useState } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import { MdLock } from "react-icons/md";
import { BiSolidPencil } from "react-icons/bi";
import "./LoginSignUpModal.css";
import { FaArrowRight } from "react-icons/fa6";

export const LoginSignUpModal = ({ closeModal }) => {
    let validationErrors = {};
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isAgree, setIsAgree] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // if (formData.password !== formData.confirmPassword) {
        //     validationErrors.confirmPassword = "Passwords do not match";
        //     setErrors(validationErrors);
        // }

        if (
            formData.name &&
            formData.mobileNumber &&
            formData.password &&
            formData.confirmPassword
        ) {
            setIsButtonEnabled(true);
        } else {
            setIsButtonEnabled(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) validationErrors.name = "Name is required";
        if (!formData.mobileNumber) validationErrors.mobileNumber = "Mobile Number is required";
        if (!formData.password) validationErrors.password = "Password is required";
        if (formData.password && (formData.password.length < 4 || formData.password.length > 15)) {
            validationErrors.password = "Password must be between 4 to 15 characters";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            // alert("Form submitted successfully!");
        }
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
                            <label>Enter Mobile Number <span className="required">*</span></label>
                            <input
                                type="text"
                                name="mobileNumber"
                                placeholder="Mobile Number"
                                required
                                value={formData.mobileNumber}
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
                                placeholder='Referral Code (Optional)'
                            />
                            <label className="password-info">Please enter the referral code shared by your friend if avaliable.</label>
                            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}

                            {Object.keys(errors).length === 0 && formData.name && formData.mobileNumber && formData.password && formData.confirmPassword && (
                                <>
                                    <button type="submit" className="btn-otp" onClick={() => setOtpSent(true)}>
                                        Send OTP <FaArrowRight />
                                    </button>
                                    <input placeholder='OTP' className='label-otp' />
                                    {otpSent && <span className="otp-success-message">OTP sent successfully!</span>}
                                </>

                            )}
                            {otpSent ? <div class="checkbox-container">
                                <input type="checkbox" id="agree" onChange={() => setIsAgree(true)} />
                                <label for="agree">I Agree with Terms and Conditions</label>
                            </div> : ""}
                            {isAgree ? <><button className='btn btn-primary' onClick={() => { alert("Account Create Successfully") }}>Create Your Account</button></> : ""}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
