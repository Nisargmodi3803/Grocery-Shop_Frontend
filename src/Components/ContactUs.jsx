import React, { useState } from 'react'
import './ContactUs.css'
import { IoLocationSharp } from "react-icons/io5";
import { MdLocalPhone } from "react-icons/md";
import { FaMobileScreen } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { BsBrowserFirefox } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value);
  };

  const validateField = (name, value) => {
    const validationErrors = { ...errors };

    if (name === "fullName") {
      if (value.trim() === "") validationErrors.fullName = "Full Name is required";
      else delete validationErrors.fullName;
    }

    if (name === "mobile") {
      if (value.trim() === "") {
        validationErrors.mobile = "Mobile Number is required";
      } else if (!mobileRegex.test(value)) {
        validationErrors.mobile = "Too short: Minimum of '10' characters";
      } else {
        delete validationErrors.mobile;
      }
    }

    if (name === "email") {
      if (value.trim() === "") {
        validationErrors.email = "Email is required";
      } else if (!emailRegex.test(value)) {
        validationErrors.email = "Invalid Email Address";
      } else {
        delete validationErrors.email;
      }
    }

    if (name === "message") {
      if (value.trim() === "") {
        validationErrors.message = "Message is required";
      } else if (value.length > 250) {
        validationErrors.message = "Message cannot exceed 250 characters";
      } else {
        delete validationErrors.message;
      }
    }

    if (name === "captcha") {
      if (value.trim() === "") validationErrors.captcha = "Captcha is required";
      else delete validationErrors.captcha;
    }

    setErrors(validationErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.keys(errors).length === 0) {
      alert('Message sent successfully');
    } else {
      alert('Please fix the errors');
    }
  };

  return (
    <>
      <div className='contact-us'>
        <section className='container-title'>
          <h1>Contact Us</h1>
        </section>
        <section className='contact-us-main'>
          <div className='get-in-touch'>
            <h1>Get In Touch</h1>
            <div className='get-in-touch-details'>
              <span>
                <IoLocationSharp /> Address :
              </span>
              <a href='https://www.google.com/maps?q=Bits+Infotech,+Block-A,+SIDDHI+VINAYAK+TOWER,+Kataria+Automobiles+Road,+Makarba,+Ahmedabad,+Gujarat'>
                <p>
                  Bits Infotech, Block-A, SIDDHI VINAYAK TOWER, Kataria Automobiles Road, Makarba, Ahmedabad, Gujarat
                </p>
              </a>

              <span>
                <MdLocalPhone /> Phone :
              </span>
              <a href='tel:+91 7016248207'>
                <p>+91 7016248207</p>
              </a>

              <span>
                <FaMobileScreen /> Mobile :
              </span>
              <a href='tel:+91 8320099260'>
                <p>+91 8320099260</p>
              </a>

              <span>
                <MdEmail /> Email :
              </span>
              <a href='mailto:sales@bitsinfotech.in'>
                <p>sales@bitsinfotech.in</p>
              </a>

              <span>
                <BsBrowserFirefox /> Website :
              </span>
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
            <div>
              <iframe width="800" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=720&amp;height=600&amp;hl=en&amp;q=+(Bits%20Infotech)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"><a href="https://www.gps.ie/">gps tracker sport</a></iframe>
            </div>
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
                value={formData.fullName}
                onChange={handleInputChange}
                required />
            </div>
            {errors.fullName && <div className="error">{errors.fullName}</div>}

            <div className='mobile-email-group'>
              <div className='mobile'>
                <label htmlFor='mobile'>Mobile Number <span className="required">*</span></label>
                <input
                  type='text'
                  id='mobile'
                  name='mobile'
                  placeholder='Mobile Number'
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required />
              </div>
              {errors.mobile && <div className="error">{errors.mobile}</div>}

              <div className='email'>
                <label htmlFor='email'>Email <span className="required">*</span></label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='Email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required />
              </div>
              {errors.email && <div className="error">{errors.email}</div>}
            </div>

            <div className='message'>
              <label htmlFor='message'>Message <span className="required">*</span></label>
              <textarea
                id='message'
                name='message'
                placeholder='Message'
                maxLength={250}
                value={formData.message}
                onChange={handleInputChange}
                required />
            </div>
            {errors.message && <div className="error">{errors.message}</div>}

            <div className='captcha'>
              <label htmlFor='captcha'>Captcha <span className="required">*</span></label>
              <input
                type='text'
                id='captcha'
                name='captcha'
                placeholder='Captcha'
                value={formData.captcha}
                onChange={handleInputChange}
                required />
            </div>
            {errors.captcha && <div className="error">{errors.captcha}</div>}
            <div className='send-message'>
              <label htmlFor='send-message'></label>
              <button type='submit' disabled={Object.keys(errors).length > 0}>Send Message</button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};
