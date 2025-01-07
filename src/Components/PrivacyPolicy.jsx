import React from 'react'
import './PrivacyPolicy.css'

export const PrivacyPolicy = () => {
  return (
    <div className='privacy-policy'>
      <section className='container-title'>
        <h1>Privacy Policy</h1>
      </section>
      <section className='footer-policys'>
        <h3>SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION? </h3>
        <p>
          When you interact with our platform, we collect the personal information you provide, such as your name, email address, and payment information. This data is used to provide our services, complete transactions, and improve your experience. We may also use your information for marketing purposes with your consent.
        </p>

        <h3>SECTION 2 - CONSENT</h3>
        <span>How do you get my consent?</span>
        <p>When you provide personal information to complete a transaction, verify your credit card, or sign up for our services, we imply that you consent to our collecting and using your information for that specific purpose.</p>

        <span>How do I withdraw my consent?</span>
        <p>If you change your mind after opting in, you can withdraw your consent at any time by contacting us at <a href="mailto:sales@bitsinfotech.in">sales@bitsinfotech.in</a> or through the account settings on our platform.</p>

        <h3>SECTION 3 - DISCLOSURE</h3>
        <p>We may disclose your personal information if required by law or if you violate our Terms of Service.</p>

        <h3>SECTION 4 - THIRD-PARTY SERVICES</h3>
        <p>We work with third-party service providers to support our operations, such as payment processors and analytics tools. These providers only collect, use, and disclose your information to the extent necessary to perform their services.

        Some providers may operate in different jurisdictions, meaning your data may become subject to the laws of those regions. For example, if you process a transaction through a third-party payment gateway, your information may be stored on servers located outside your country.

        We recommend reviewing the privacy policies of any third-party services we use to understand how your data is managed.</p>
      </section>
    </div>
  )
}
