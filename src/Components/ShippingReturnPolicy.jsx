import React from 'react'
import './ShippingReturnPolicy.css'

export const ShippingReturnPolicy = () => {
  return (
    <div className='shipping-return-policy'>
      <section className='container-title'>
        <h1>Shipping & Return Policy</h1>
      </section>
      <section className='footer-policys'>
        <h3>Shipping Policy: </h3>
        <p>
          We ship all orders within 24 hours of receiving the order. We ship all days except Sundays and National Holidays.
          We ship through leading courier services and you can track your order online after it is shipped.
          We provide free shipping on all orders above Rs. 500. For orders below Rs. 500, we charge a nominal shipping fee of Rs. 50.
        </p>
        <h3>Return Policy: </h3>
        <p>
          We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.
          To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.
          You’ll also need the receipt or proof of purchase.
          To start a return, you can contact us at
        </p>
      </section>
    </div>
  )
}
