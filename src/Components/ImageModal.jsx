// ImageModal.js
import React from 'react';
import './ImageModal.css';
import { IoCloseSharp } from "react-icons/io5";

export const ImageModal = ({ image, closeModal }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <button onClick={closeModal} className="close-button"><IoCloseSharp /></button>
                <img src={`http://localhost:9000/uploads/${image}`} alt="Customer" className="modal-image" />
            </div>
        </div>
    );
};
