import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './Header';
import { Home } from './Home';
import { ShopByCategory } from './ShopByCategory';
import { Blog } from './Blog';
import { AboutUs } from './AboutUs';
import { ContactUs } from './ContactUs';
import Footer from './Footer';
import { Demo } from './demo';
import { ShippingReturnPolicy } from './ShippingReturnPolicy';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsConditions } from './TermsConditions';
import Product from './Product';
import { ShopByBrand } from './ShopByBrand';

export const NavRouters = () => {
  // useEffect(() => {
  //   <Header />;
  // }, []);

  return (
    <BrowserRouter>
      <Header />
      {/* <Home /> */}
      <Routes>
        <Route path="/ecommerce" element={<Home />} />
        <Route path="/ecommerce/shop-By-Category" element={<ShopByCategory />} />
        <Route path="/ecommerce/blog" element={<Blog />} />
        <Route path="/ecommerce/about-us" element={<AboutUs />} />
        <Route path="/ecommerce/contact-us" element={<ContactUs />} />
        <Route
          path="/ecommerce/shipping-and-return-policy"
          element={<ShippingReturnPolicy />}
        />
        <Route path="/ecommerce/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/ecommerce/terms-conditions" element={<TermsConditions />} />
        <Route path="/ecommerce/demo" element={<Demo />} />
        <Route path="/ecommerce/product/:productSlugTitle" element={<Product/>}/>
        <Route path='/ecommerce/shop-by-brand' element={<ShopByBrand/>}/>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};
