import './MyOrderList.css'
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

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));
const productImages = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const MyOrderList = () => {
  const [customer, setCustomer] = useState({});
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false); // For handling hover state
  const [file, setFile] = useState(null); // To hold the selected file
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [orderList, setOrderList] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);

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

  const fetchOrderList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/orders/${sessionStorage.getItem("customerEmail")}`);
      if (response.status === 200) {
        setOrderList(response.data);
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
  }

  const fetchOrderDetails = async (invoiceNum) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/product-order/${invoiceNum}`);

      if (response.status === 200) {
        return response.data;
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
  }

  const fetchDetails = async () => {
    const details = {};
    for (const order of orderList) {
      try {
        const response = await fetchOrderDetails(order.invoiceNum); // Fetch order details (including products)
        details[order.invoiceNum] = response; // Store products in state using invoiceNum as key
      } catch (error) {
        console.error(`Error fetching details for ${order.invoiceNum}:`, error);
      }
    }
    setOrderDetails(details);
  };

  useEffect(() => {
    fetchOrderList();
  }, []);

  useEffect(() => {
    if (orderList.length > 0) {
      fetchDetails();
    }
  }, [orderList]);

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
                      window.location.reload();
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
            <li className='active' onClick={() => {
              navigate('/ecommerce/my-orders');
              window.location.reload();
            }}><CiCircleList /> Order List</li>
            <li onClick={() => {
              navigate('/ecommerce/refer-and-earn');
              window.location.reload();
            }}><MdCurrencyRupee /> Refer & Earn</li>
            <li onClick={() => {
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
            <h1>Order List</h1>
          </div>
          <div className='my-profile-section-body'>
            {/* <div className='profile-detail'> */}
              <div className="order-container">
                {orderList.length > 0 &&
                  orderList.map((order) => (
                    <div key={order.invoiceNum} className="order-box">
                      <h3>{order.invoicePrefix + order.invoiceNum}</h3>
                      <div className="order-date">
                        <span>Date: {order.invoiceDate}</span>
                      </div>
                      {orderDetails[order.invoiceNum] ? (
                        orderDetails[order.invoiceNum].map((item) => {
                          const imageSrc =
                            productImages[item.product?.image_url] || productImages["default.jpg"];

                          return (
                            <div key={item.productId} className="order-details">

                              <div className="order-image">
                                <img src={imageSrc} alt="Product" />
                                <span>{item.product?.name}</span>
                                <span>Quantity : {item.quantity}</span>
                              </div>

                              <div className="order-price">
                                <span>Price : ₹{item.totalAmount}</span>
                                <span>Payment : {order.invoicePaymentMode == 1 ? "Cash on Delivery" : "Online Payment"}</span>
                              </div>

                              <div className='order-status'>
                                <span>Status : {order.invoiceStatus == 1 ?
                                  <span>Pending</span>
                                  : order.invoiceStatus == 2 ?
                                    <span>Confirm</span>
                                    : order.invoiceStatus == 3 ?
                                      <span>Dispatched</span> :
                                      order.invoiceStatus == 4 ?
                                        <span>Delivered</span> :
                                        order.invoiceStatus == 5 ?
                                          <span>Rejected</span> :
                                          order.invoiceStatus == 6 ?
                                            <span>Cancelled</span> : ""
                                }</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <span>Loading products...</span> // ✅ Show a message if products are still loading
                      )}
                    </div>
                  ))}
              </div>


            {/* </div> */}
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
