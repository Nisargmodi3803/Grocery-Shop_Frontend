import './CouponCode.css'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ImageModal } from './ImageModal';
import { useNavigate } from 'react-router-dom';
import { FaUserEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useLoading } from "../Context/LoadingContext";
import { IoPersonOutline } from "react-icons/io5";
import { TbPasswordUser } from "react-icons/tb";
import { CiCircleList } from "react-icons/ci";
import { FaRegHeart } from "react-icons/fa6";
import { MdCurrencyRupee } from "react-icons/md";
import { RiCouponLine } from "react-icons/ri";
import { BsCreditCard2Back } from "react-icons/bs";
import { MdLock } from "react-icons/md";
import Swal from 'sweetalert2';
import noCoupons from '../assets/Logo/No Wishlist.jpg';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));


export const CouponCode = () => {
  const [customer, setCustomer] = useState({});
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false); // For handling hover state
  const [file, setFile] = useState(null); // To hold the selected file
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [coupons, setCoupons] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copiedCouponId, setCopiedCouponId] = useState(null);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/profile/${sessionStorage.getItem("customerEmail")}`);
      if (response.status === 200) {
        setCustomer(response.data);
        setImage(response.data.customerImage || 'default.png');
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Customer not found");
      } else {
        console.error("Error fetching customer details:", error);
        alert("Something went wrong in fetching Customer Details. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("isAuthenticated")) {
      navigate("/ecommerce/");
    }
  }, []);

  const handleImageChange = async (event) => {
    const selectedFile = event.target.files[0];
    console.log("Handle Image Change Call");
    // setLoading(true);
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile)); // Set the preview
      setIsEditing(true);

      // Create FormData and append the file with the correct key "file"
      const formData = new FormData();
      formData.append('file', selectedFile);  // <-- Key should be "file" (matches backend)

      try {
        console.log("API CALL")
        const response = await axios.patch(
          `http://localhost:9000/change-profile-image/${sessionStorage.getItem("customerEmail")}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 200) {
          console.log('Image uploaded successfully:', response.data);
          setImage(customer.customerImage);  // Update the image if successful
          window.location.reload();
        } else {
          console.error('Error uploading image:', response);
          alert("Error uploading image. Please try again!");
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert("Something went wrong with image upload.");
      }
    }
  };


  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  const handleViewClick = () => {
    if (image !== 'default.png') {
      setShowModal(true);
    }
  };

  const deleteProfileImageAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Profile Image?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDeleteClick = async () => {
    const result = await deleteProfileImageAlert(); // Await the user's response

    if (result.isConfirmed) {
      if (image !== 'default.png') {
        try {
          const response = await axios.patch(`http://localhost:9000/delete-profile-image/${sessionStorage.getItem("customerEmail")}`);
          if (response.status === 200) {
            console.log('Image deleted successfully:', response.data);
            setImage('default.png'); // Update the image after deletion
            Swal.fire("Deleted!", "Your profile image has been deleted.", "success");
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("Customer not found");
            Swal.fire("Error", "Customer not found.", "error");
          } else {
            console.error('Error deleting image:', error);
            Swal.fire("Error", "Something went wrong. Please try again!", "error");
          }
        }
      }
    }
  };


  const handleEditClick = () => {
    document.getElementById("file-input").click(); // Trigger the file input on edit click
  };

  const logoutAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to Logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleLogout = async () => {
    const result = await logoutAlert();
    if (result.isConfirmed) {
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("customerEmail");
      sessionStorage.removeItem("cartCount");
      sessionStorage.removeItem("customerData");
      await Swal.fire("Logged Out!", "You have been logged out.", "success");
      navigate("/ecommerce/");
      window.location.reload();
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://localhost:9000/all-coupons');

      if (response.status === 200) {
        setCoupons(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Coupons not found");
      } else {
        console.error("Error fetching coupons:", error);
        alert("Something went wrong in fetching Coupons. Please try again!");
      }
    }
  }

  useEffect(() => {
    console.log("Use Effect Call")
    fetchCoupons();
  }, []);


  const handleCopy = (couponCode, couponId) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCouponId(couponId);
    setTimeout(() => setCopiedCouponId(null), 4000);
  };


  return (
    <div className='my-wishlist'>
      <div className='profile-section'>
        <div className='profile-nav-section'>
          <div className='profile-info'>
            <div
              className='profile-image'
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={image && image !== 'default.png' ? `http://localhost:9000/uploads/${image}` : imageMap[image] || image}
                alt="Profile"
                onClick={() => {
                  handleViewClick();
                }}
                disabled={image === 'default.png'}
              />
              {hovered && (
                <div className="image-options">
                  <button className="edit-btn" onClick={() => {
                    handleEditClick();
                    // window.location.reload();
                  }}>
                    {/* <FaUserEdit/> Edit */}
                    <FaUserEdit />
                  </button>
                  <button
                    className={`view-btn ${image === 'default.png' ? 'disabled' : ''}`}
                    onClick={() => {
                      handleDeleteClick();
                    }}
                    disabled={image === 'default.png'}
                  >
                    {/* <MdDelete/> Delete */}
                    <MdDelete />
                  </button>
                </div>
              )}
            </div>
            <h3><b>Hello</b> {customer.customerName}</h3>
            <p>{customer.customerMobile}</p>
            <p className='ecommerce-points'>
              Ecommerce Points: <span>{customer.customerPoints ? customer.customerPoints.toFixed(2) : '0.00'}</span>
            </p>
          </div>
          <ul className='nav-list'>
            <li onClick={() => {
              navigate('/ecommerce/my-profile');
              window.location.reload();
            }}><IoPersonOutline /> My Profile</li>

            <li onClick={() => {
              navigate('/ecommerce/change-password');
              window.location.reload();
            }}><TbPasswordUser /> Change Password</li>

            <li onClick={() => {
              navigate('/ecommerce/my-wishlist');
              window.location.reload();
            }}><FaRegHeart /> My Wishlist</li>

            <li onClick={() => {
              navigate('/ecommerce/my-orders');
              window.location.reload();
            }}><CiCircleList /> Order List</li>

            <li onClick={() => {
              navigate('/ecommerce/refer-and-earn');
              window.location.reload();
            }}><MdCurrencyRupee /> Refer & Earn</li>

            <li className='active' onClick={() => {
              navigate('/ecommerce/coupon-code');
              window.location.reload();
            }}><RiCouponLine /> Coupon Code</li>

            <li onClick={() => {
              navigate('/ecommerce/my-ecommerce');
              window.location.reload();
            }}><BsCreditCard2Back /> My Ecommerce</li>

            <li onClick={handleLogout}><MdLock /> Logout</li>
          </ul>
        </div>

        <div className='my-profile-section'>
          <div className='my-profile-section-header'>
            <h1>GET THE BEST DEAL HAVE TO USE THE BELOW COUPON CODE</h1>
          </div>
          <div className='my-profile-section-body'>
            {coupons.length > 0 ? (
              <div className="coupon-modal-content">
                {coupons.map((coupon) => (
                  <div className="coupon-item" key={coupon.couponId}>
                    <div className="coupon-item-header">
                      <div className="coupon-item-header-title">
                        <h3>{coupon.couponCode}</h3>
                        <span 
                            onClick={() => handleCopy(coupon.couponCode, coupon.couponId)}
                            className={`coupon-copy-btn ${copiedCouponId === coupon.couponId ? "copied" : ""}`}
                        >
                            {copiedCouponId === coupon.couponId ? "COPIED!" : "COPY"}
                        </span>
                      </div>

                      <div className="coupon-item-header-info">
                        <span>Save ₹{coupon.couponMaxDiscount} on this Order!</span>
                      </div>
                    </div>

                    <div className="coupon-item-body">
                      <span>{coupon.couponTitle}</span>
                    </div>
                    <div className='coupon-item-footer'>
                      <span>Minimum Amount : ₹{coupon.couponMinimumBillAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='no-wishlist'>
                <h1 style={{ fontSize: '1.5rem', color: '#133365' }}>
                  NO COUPON CODE IS AVAILABLE!
                </h1>
                <img src={noCoupons} alt='No Coupons' />
              </div>
            )}
          </div>
        </div>
        <input
          id="file-input"
          type="file"
          style={{ display: 'none' }}
          onChange={handleImageChange}
          accept="image/*"
        />
      </div>
      {showModal && <ImageModal image={image} closeModal={closeModal} />}
    </div>
  );
}

