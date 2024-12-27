import React from 'react';
import './Footer.css';
import { MdPhone } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import { MdMail } from "react-icons/md";
import { TbWorld } from "react-icons/tb";
import { FaFacebook } from "react-icons/fa6";
import { FaInstagramSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";

const Footer = () => {
    return (
        <>
            <div className="footer-top">
                <div className="feature-item">
                    <span className="circle">1</span>
                    <p>Free & Next Day Delivery</p>
                </div>
                <div className="feature-item">
                    <span className="circle">2</span>
                    <p>100% Satisfaction Guarantee</p>
                </div>
                <div className="feature-item">
                    <span className="circle">3</span>
                    <p>Great Daily Deals Discount</p>
                </div>
            </div>
            <div className="footer-container">
                <div className="footer-middle">
                    <div className="company-info">
                        <img
                            src="https://bitsinfotech.in/ecommerce/fmcg_upload/logo/060622034612bits.png"
                            alt="Company Logo"
                            title="Bits Infotech"
                            className="company-logo"
                            loading='lazy'
                        />
                        <br />
                        <MdPhone /><a href='https://bitsinfotech.in/ecommerce/tel:+91%207016248207'>+91 7016248207</a>
                        <br />
                        <FaMobileScreenButton /><a href='https://bitsinfotech.in/ecommerce/tel:+91%208320099260'>+91 8320099260</a>
                        <br />
                        <a href='https://www.google.com/maps/place/Bits+Infotech/@22.9945958,72.4964289,17z/data=!3m1!4b1!4m6!3m5!1s0x395e9ac2f80829ab:0x7be5571ea6defb37!8m2!3d22.9945958!4d72.4990038!16s%2Fg%2F11c30q4vby!5m1!1e1?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D'><strong>Address:</strong> Bits Infotech, Block-A, SIDDHI VINAYAK TOWER, Kataria Automobiles Road, Makarba, Ahmedabad, Gujarat</a>
                        <br />
                        <a href='mailto:sales@bitsinfotech.in'><MdMail /> sales@bitsinfotech.in</a>
                        <br />
                        <a href="https://bitsinfotech.in" target="_blank" rel="noopener noreferrer"><TbWorld /> bitsinfotech.in</a>
                    </div>
                    <div className="blog-links">
                        <div className='blog-links col-1'>
                            <h6>LATEST BLOG</h6>
                            <a href='https://bitsinfotech.in/ecommerce/easy-homemade-flatbread-crackers'><h6>Easy Homemade Flatbread Crackers...</h6></a><p><FaRegCalendarAlt /> July 18,2022</p>
                            <hr />
                            <a href='https://bitsinfotech.in/ecommerce/cucumber-agua-fresca'><h6>Cucumber Agua Fresca</h6></a><p><FaRegCalendarAlt /> July 22,2022</p>
                            <hr />
                            <a href='https://bitsinfotech.in/ecommerce/zaalouk-toasts-with-burrata'><h6>Zaalouk Toasts with Burrata</h6></a><p><FaRegCalendarAlt /> June 28, 2022</p>
                        </div>
                        <div className='blog-links col-2'>
                            <br />
                            <a href='https://bitsinfotech.in/ecommerce/obsession-worthy-peanut-butter-cookie-ice-cream'><h6>OBSESSION-WORTHY PEANUT BUTTER COOKIE ICE CREAM</h6></a><p><FaRegCalendarAlt /> May 20, 2022</p>
                            <hr />
                            <a href='https://bitsinfotech.in/ecommerce/summer-ricotta-with-grilled-vegetables'><h6>summer ricotta with grilled vegetables</h6></a><p><FaRegCalendarAlt /> April 05, 2022</p>
                            <hr />
                            <a href='https://bitsinfotech.in/ecommerce/peach-gazpacho-ingredients'><h6>PEACH GAZPACHO INGREDIENTS</h6></a><p><FaRegCalendarAlt /> March 08, 2022</p>
                        </div>
                    </div>
                    <div className="app-links">
                        <h3>Download App</h3>
                        <a href='https://play.google.com/store/apps/developer?id=Bits+Infotech'><img src="https://bitsinfotech.in/ecommerce/img/google.png" alt="Google Play" /></a>
                        <a href='https://bitsinfotech.in/ecommerce/#'><img src="https://bitsinfotech.in/ecommerce/img/apple.png" alt="App Store" /></a>
                    </div>
                    <div className='social-links'>
                        <h3>Get in Touch</h3>
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
            </div>
            <div className="footer-bottom">
                <p className='title'>Made with ❤️ by Bits Infotech</p>
                <p className='links'>
                    <a href="/ecommerce/shipping-and-return-policy">Shipping and Returns</a> |
                    <a href="/ecommerce/privacy-policy">Privacy Policy</a> |
                    <a href="/ecommerce/terms-conditions">Terms and Conditions</a>
                </p>
                <img
                    src='https://bitsinfotech.in/ecommerce/img/payment_methods.png'
                    loading='lazy' />
            </div>
        </>
    );
};

export default Footer;
