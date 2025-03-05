import React, { useEffect, useState } from "react";
import "./ShowOffers.css";
import { IoClose } from "react-icons/io5"; // Close icon
import axios from "axios";

const ShowOffers = ({ closeOffersModal, amount }) => {
  const [offers, setOffers] = useState([]);
  const [saveAmount, setSaveAmount] = useState([]);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/coupons?amount=${amount}`);

      if (response.status === 200) {
        setOffers(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Offers not found");
      } else {
        console.error("Error fetching offers:", error);
        alert("Something went wrong in fetching Offers. Please try again!");
      }
    }
  }

  // const calculateSaveAmount = () => {
  //   const saveAmount = offers.map((offer) => {
  //     const minAmt = offer.couponMinimumBillAmount;
  //     const maxDiscount = offer.couponMaxDiscount;

  //     const discount = 
  //   }
  // }

  useEffect(() => {
    fetchOffers();

    // if(offers.length > 0) {
    //   calculateSaveAmount();
    // }
  }, [amount]);

  useEffect(() => {
    document.body.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <div className="offer-modal-overlay">
      <div className="offer-modal-container">
        <div className="offer-modal-header">
          <h2>Available Offers</h2>
          <div className="offer-close-btn" onClick={closeOffersModal}>
            <IoClose size={22} />
          </div>
        </div>
        <div className="offer-modal-content">
          {offers.length > 0 ? (
            <div>
              {offers.map((offer) => (
                <div className="offer-item" key={offer.couponId}>
                  <div className="offer-item-header">
                    <div className="offer-item-header-title">
                      <h3>{offer.couponCode}</h3>
                      <span>APPLY</span>
                    </div>
                    
                    <div className="offer-item-header-info">
                      <p>Save ₹{offer.couponMaxDiscount} on this Order!</p>
                    </div>
                  </div>

                  <div className="offer-item-body">
                    <span>{offer.couponTitle}</span>
                  </div>
                </div>
              ))}
              <p className="offer-available">Offers are available</p>
            </div>
          ) : (
            <p className="offer-no-offers">NOT AVAILABLE</p>
          )}
        </div>

      </div>
    </div >
  );
};

export default ShowOffers;
