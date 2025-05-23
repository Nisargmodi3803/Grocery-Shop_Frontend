import './ReferAndEarn.css'
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
import referEarnImage from "../assets/Logo/refer.png";

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));


export const ReferAndEarn = () => {
  const [customer, setCustomer] = useState({});
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false); // For handling hover state
  const [file, setFile] = useState(null); // To hold the selected file
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [copied, setCopied] = useState(false);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/customer-email/${sessionStorage.getItem("customerEmail")}`);
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
          // window.location.reload();
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
      // window.location.reload();
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customer.customerReferralCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const shareText = `🎉 Join me on this amazing shopping platform! 🛍️\n\n
Sign up using my referral code: *${customer.customerReferralCode}* to get exciting rewards. 💰\n\n
Join now 👇\nhttp://localhost:3000/ecommerce/`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join & Earn Rewards! 🎁",
        text: shareText,
      })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported on this device.");
    }
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
            <h3>Hello {customer.customerName}</h3>
            <p>{customer.customerMobile}</p>
            <p className='ecommerce-points'>
              Ecommerce Points: <span>{customer.customerPoints ? customer.customerPoints.toFixed(2) : '0.00'}</span>
            </p>
          </div>
          <ul className='nav-list'>
            <li onClick={() => {
              navigate('/ecommerce/my-profile');
              // window.location.reload();
            }}><IoPersonOutline /> My Profile</li>

            <li onClick={() => {
              navigate('/ecommerce/change-password');
              // window.location.reload();
            }}><TbPasswordUser /> Change Password</li>

            <li onClick={() => {
              navigate('/ecommerce/my-wishlist');
              // window.location.reload();
            }}><FaRegHeart /> My Wishlist</li>

            <li onClick={() => {
              navigate('/ecommerce/my-orders');
              // window.location.reload();
            }}><CiCircleList /> Order List</li>

            <li className='active' onClick={() => {
              navigate('/ecommerce/refer-and-earn');
              // window.location.reload();
            }}><MdCurrencyRupee /> Refer & Earn</li>

            <li onClick={() => {
              navigate('/ecommerce/coupon-code');
              // window.location.reload();
            }}><RiCouponLine /> Coupon Code</li>

            <li onClick={() => {
              navigate('/ecommerce/my-ecommerce');
              // window.location.reload();
            }}><BsCreditCard2Back /> My Ecommerce</li>

            <li onClick={handleLogout}><MdLock /> Logout</li>
          </ul>
        </div>

        <div className='my-profile-section'>
          <div className='my-profile-section-header'>
            <h1>REFER A FRIEND & EARN ECOMMERCE POINTS</h1>
          </div>
          <div className='my-profile-section-body'>
            <div className='profile-detail'>
              <div className='refer-earn-image'>
                <img
                  src={referEarnImage}
                  alt='refer-earn-image'
                />
              </div>

              <h2>REFFER MORE TO EARN MORE</h2>
              <div className='refer-earn-text'>
                <label>
                  You can earn more Ecommerce's Points by referring your friends to Ecommerce's App. Send them your referral code...
                </label>
              </div>

              <div className='refer-code'>
                <h1>{customer.customerReferralCode}</h1>
              </div>

              <button onClick={handleCopy} className="copy-btn">
                {copied ? "COPIED!" : "COPY"}
              </button>

              <button onClick={handleShare} className='copy-btn'>SHARE</button>
            </div>
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

