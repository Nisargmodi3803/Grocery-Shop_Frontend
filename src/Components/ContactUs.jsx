import React, { useState, useEffect } from 'react';
import './ContactUs.css';
import { IoLocationSharp } from "react-icons/io5";
import { MdLocalPhone, MdEmail } from "react-icons/md";
import { FaMobileScreen, FaFacebook } from "react-icons/fa6";
import { BsBrowserFirefox } from "react-icons/bs";
import { FaSquareXTwitter } from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";
import axios from 'axios';
import { useLoading } from '../Context/LoadingContext';

export const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    message: '',
    captcha: ''
  });

  const [errors, setErrors] = useState({});
  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const randomString = Math.random().toString(36).slice(2, 8);
  const [captcha, setCaptcha] = useState(randomString);
  const [count, setCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState({});
  const [success, setSuccess] = useState();

  const { setLoading } = useLoading();

  const fetchCustomerDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/customer-email/${sessionStorage.getItem("customerEmail")}`);

      if (response.status === 200) {
        setCustomer(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Customer not found");
      } else {
        console.error("Error fetching customer details:", error);
        alert("Something went wrong. Please try again!");
      }
    }
  }

  useEffect(() => {
    const authStatus = sessionStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);

    if (authStatus) {
      fetchCustomerDetails();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true); 
    const timer = setTimeout(() => setLoading(false), 1000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  useEffect(() => {
    if (isAuthenticated && customer) {
      setFormData((prevData) => ({
        ...prevData,
        fullName: customer.customerName || '',
        mobile: customer.customerMobile || '',
        email: customer.customerEmail || ''
      }));
    }
  }, [customer, isAuthenticated]);



  const refreshString = () => {
    setCaptcha(Math.random().toString(36).slice(2, 8));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'message') {
      setCount(value.length);
    }

    validateField(name, value);
  };

  const validateField = (name, value) => {
    const validationErrors = { ...errors };

    if (name === "fullName") {
      if (value.trim() === "") validationErrors.fullName = "Full Name is required";
      else delete validationErrors.fullName;
    }

    if (name === "mobile") {
      if (value.trim() === "") validationErrors.mobile = "Mobile Number is required";
      else if (!mobileRegex.test(value)) validationErrors.mobile = "Invalid Mobile Number";
      else delete validationErrors.mobile;
    }

    if (name === "email") {
      if (value.trim() === "") validationErrors.email = "Email is required";
      else if (!emailRegex.test(value)) validationErrors.email = "Invalid Email Address";
      else delete validationErrors.email;
    }

    if (name === "message") {
      if (value.trim() === "") validationErrors.message = "Message is required";
      else if (value.length > 250) validationErrors.message = "Message cannot exceed 250 characters";
      else delete validationErrors.message;
    }

    if (name === "captcha") {
      if (value.trim() === "") validationErrors.captcha = "Captcha is required";
      else delete validationErrors.captcha;
    }

    setErrors(validationErrors);
  };

  const handleContactUs = async () => {
    try {
      const response = await axios.post(`http://localhost:9000/contact`, {
        name: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        message: formData.message
      });

      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setSuccess(false);
          console.log("Bad Request: ", error.response.data);
        } else {
          setSuccess(false);
          console.error("Error sending message:", error.response.data);
          alert("Something went wrong. Please try again!");
        }
      } else if (error.request) {
        console.error("No response received from server", error.request);
        alert("Server is unreachable. Please try again later.");
      } else {
        console.error("Request setup error", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    }finally {
      setLoading(false); // Hide Loading
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const formErrors = {};

    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (!formData[key]) {
        formErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0 && formData.captcha === captcha) {
      handleContactUs();
      setFormData({
        fullName: '',
        mobile: '',
        email: '',
        message: '',
        captcha: ''
      });
      refreshString();
    } else if (formData.captcha !== captcha) {
      setErrors((prevErrors) => ({ ...prevErrors, captcha: "Captcha does not match" }));
    }

    setTimeout(() => {
      setSuccess();
      window.location.reload();
    }, 4000);
  };

  return (
    <div className='contact-us'>
      <section className='container-title'>
        <h1>Contact Us</h1>
      </section>
      <section className='contact-us-main'>
        <div className='get-in-touch'>
          <h1>Get In Touch</h1>
          <div className='get-in-touch-details'>
            <span><IoLocationSharp /> Address :</span>
            <a href='https://www.google.com/maps?q=Bits+Infotech,+Block-A,+SIDDHI+VINAYAK+TOWER,+Kataria+Automobiles+Road,+Makarba,+Ahmedabad,+Gujarat'>
              <p>Bits Infotech, Block-A, SIDDHI VINAYAK TOWER, Kataria Automobiles Road, Makarba, Ahmedabad, Gujarat</p>
            </a>
            <span><MdLocalPhone /> Phone :</span>
            <a href='tel:+917016248207'>
              <p>+91 7016248207</p>
            </a>
            <span><FaMobileScreen /> Mobile :</span>
            <a href='tel:+918320099260'>
              <p>+91 8320099260</p>
            </a>
            <span><MdEmail /> Email :</span>
            <a href='mailto:sales@bitsinfotech.in'>
              <p>sales@bitsinfotech.in</p>
            </a>
            <span><BsBrowserFirefox /> Website :</span>
            <a href='https://bitsinfotech.in'>
              <p>bitsinfotech.in</p>
            </a>
            <a href="https://www.facebook.com/Bitsinfotech1716/" className="social-icon"><FaFacebook className='facebook' /></a>
            <a href="https://twitter.com/BitsInfotech" className="social-icon"><FaSquareXTwitter className='twitter' /></a>
            <a href="https://www.instagram.com/bits_infotech/" className="social-icon">
              <img
                className='instagram'
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/900px-Instagram_icon.png?20200512141346'
                loading='lazy' />
            </a>
          </div>
        </div>
        <div className='google-map'>
          <iframe
            width="800"
            height="600"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://maps.google.com/maps?width=720&amp;height=600&amp;hl=en&amp;q=+(Bits%20Infotech)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed">
          </iframe>
        </div>
      </section>
      <section className='contact-form'>
        <h1>Contact Us</h1>
        <form onSubmit={handleSubmit}>
          <div className='full-name'>
            <label htmlFor='full-name'>Full Name <span className="required">*</span></label>
            <input
              type='text'
              id='full-name'
              name='fullName'
              placeholder='Full Name'
              value={isAuthenticated ? customer.customerName || '' : formData.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName && <div className="error">{errors.fullName}</div>}
          </div>
          <div className='mobile-email-group'>
            <div className='mobile'>
              <label htmlFor='mobile'>Mobile Number <span className="required">*</span></label>
              <input
                type='text'
                id='mobile'
                name='mobile'
                placeholder='Mobile Number'
                value={isAuthenticated ? customer.customerMobile || '' : formData.mobile}
                onChange={handleInputChange}
              />
              {errors.mobile && <div className="error">{errors.mobile}</div>}
            </div>
            <div className='email'>
              <label htmlFor='email'>Email <span className="required">*</span></label>
              <input
                type='email'
                id='email'
                name='email'
                placeholder='Email'
                value={isAuthenticated ? customer.customerEmail || '' : formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </div>
          </div>
          <div className='message'>
            <label htmlFor='message'>Message
              <span className="required">*</span>
              <span> (Maximum 250 characters)</span>
              {count > 0 && <span className='count-characters'>  {count}</span>}
            </label>
            <textarea
              id='message'
              name='message'
              placeholder='Message'
              maxLength={250}
              value={formData.message}
              onChange={handleInputChange}
            />
            {errors.message && <div className="error">{errors.message}</div>}
          </div>
          <div className='captcha'>
            <div className='captcha-input'>
              <label htmlFor='captcha'>Captcha <span className="required">*</span></label>
              <input
                type='text'
                id='captcha'
                name='captcha'
                placeholder='Enter Captcha'
                value={formData.captcha}
                onChange={handleInputChange}
              />
            </div>
            <div className='captcha-image'>
              <span>
                {captcha} <IoMdRefresh onClick={refreshString} className='refresh-button' />
              </span>
            </div>
          </div>
          {errors.captcha && <div className="error">{errors.captcha}</div>}
          <div className='send-message'>
            <button type='submit'>Send Message</button>
          </div>
          {success === true ? (
            <span className="otp-success-message">✅ Message Sent Successfully!</span>
          ) : success === false ? (
            <span className="otp-error-message">❌ Unable to send message</span>
          ) : null}
        </form>
      </section>
    </div>
  );
};
