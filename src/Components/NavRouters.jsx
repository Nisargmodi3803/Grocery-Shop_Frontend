import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
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
import { Brand } from './Brand';
import { SubCategory } from './SubCategory';
import { BlogMain } from './BlogMain';
import { MyCart } from './MyCart';
import { MyProfile } from './MyProfile';
import { ChangePassword } from './ChangePassword';
import { MyWishList } from './MyWishList';
import { MyOrderList } from './MyOrderList';
import { ReferAndEarn } from './ReferAndEarn';
import { CouponCode } from './CouponCode';
import { MyPoints } from './MyPoints';
import { Offers } from './Offers';
import { OffersNewYear } from './OffersNewYear';
import { SearchResult } from './SearchResult';
import { ViewOrder } from './ViewOrder';

export const NavRouters = () => {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/ecommerce" element={<Home />} />
        <Route path="/ecommerce/shop-By-Category" element={<ShopByCategory />} />
        <Route path="/ecommerce/blog" element={<Blog />} />
        <Route path="/ecommerce/about-us" element={<AboutUs />} />
        <Route path="/ecommerce/contact-us" element={<ContactUs />} />
        <Route path="/ecommerce/shipping-and-return-policy" element={<ShippingReturnPolicy />} />
        <Route path="/ecommerce/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/ecommerce/terms-conditions" element={<TermsConditions />} />
        <Route path="/ecommerce/demo" element={<Demo />} />
        <Route path="/ecommerce/product/:productSlugTitle" element={<Product />} />
        <Route path='/ecommerce/shop-by-brand' element={<ShopByBrand />} />
        <Route path='/ecommerce/brand/:brandSlugTitle' element={<Brand />} />
        <Route path='/ecommerce/sub-category/:subcategorySlugTitle' element={<SubCategory />} />
        <Route path='/ecommerce/blog/:blogSlugTitle' element={<BlogMain />} />
        <Route path='/ecommerce/checkout' element={<MyCart />} />
        <Route path='/ecommerce/my-profile' element={<MyProfile/>}/>
        <Route path='/ecommerce/change-password' element={<ChangePassword/>}/>
        <Route path='/ecommerce/my-wishlist' element={<MyWishList/>}/>
        <Route path='/ecommerce/my-orders' element={<MyOrderList/>}/>
        <Route path='/ecommerce/refer-and-earn' element={<ReferAndEarn/>}/>
        <Route path='/ecommerce/coupon-code' element={<CouponCode />}/>
        <Route path='/ecommerce/my-ecommerce' element={<MyPoints/>}/>
        <Route path='/ecommerce/offers/best-of-veg-fruits' element={<Offers/>}/>
        <Route path='/ecommerce/offers/new-year' element={<OffersNewYear/>}/>
        <Route path='/ecommerce/search-result/:searchQuery' element={<SearchResult/>}/>
        <Route path='/ecommerce/view-order/:invoiceNum' element={<ViewOrder/>}/>
      </Routes>
      <Footer />
    </>
  );
};
