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
import { MdCancelPresentation } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

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


  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const totalPages = Math.ceil(orderList.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = orderList.slice(startIndex, endIndex);

  // Pagination Settings
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

  // Handle Click
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };


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

  const fetchOrderDetails = async (invoiceId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:9000/product-order/${invoiceId}`);

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
        const response = await fetchOrderDetails(order.invoiceId); // Fetch order details (including products)
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

  const getOrderStatus = (status) => {
    switch (status) {
      case 1: return "Pending";
      case 2: return "Confirmed";
      case 3: return "Dispatched";
      case 4: return "Delivered";
      case 5: return "Rejected";
      case 6: return "Cancelled";
      default: return "";
    }
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return "Invalid Date";

    const dateParts = dateString.split("-");
    if (dateParts.length === 3) {
      dateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" }); // "Jan", "Feb", etc.
    const year = date.getFullYear();

    let [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "Invalid Time";

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}, ${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const handleCancelOrder = async (invoiceNum) => {
    const result = await Swal.fire({
      title: `Are you sure you want to cancel Order BI - ${invoiceNum}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/cancel-order/${invoiceNum}`)
        if (response.status === 200) {
          console.log("Order cancelled successfully");
          fetchOrderList();
          fetchDetails();
          await Swal.fire("Cancelled!", "Your order BI - " + invoiceNum + " has been cancelled.", "success");
        }
        else {
          await Swal.fire("Error", "Something went wrong. Please try again!", "error");
        }
      } catch (error) {
        if (error.response.status === 404) {
          console.log("Invoice not found");
        } else {
          console.error("Error cancelling order:", error);
          alert("Something went wrong in cancelling order. Please try again!");
        }
      }
    }
  }

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

          {/* <div className='brand-header'>
            <span class="brand-name"></span>
            <select class="sort-dropdown">
              <option>Last 30 days</option>
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
              <option>Sort by: Discount (High to Low)</option>
              <option>Sort by: Discount (Low to High)</option>
              <option>Sort by: Name (A to Z)</option>
              <option>Sort by: Name (Z to A)</option>
            </select>
          </div> */}
          <div className='my-profile-section-body'>
            <div className="order-container">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <div key={order.invoiceNum} className="order-box"
                    onClick={() => {
                      navigate(`/ecommerce/view-order/${order.invoiceNum}`);
                      window.location.reload();
                    }}>
                    <div className="order-title">
                      <h3>{order.invoicePrefix + order.invoiceNum}</h3>
                      <p className="order-date">
                        Placed at {formatDateTime(order.invoiceDate, order.invoiceTime)}
                      </p>
                      {order.invoiceStatus == 1 && (
                        <span className="cancel-button" onClick={() => handleCancelOrder(order.invoiceNum)}>
                          <MdCancelPresentation />
                        </span>
                      )}
                    </div>
                    <div className='order-details'>
                      <div className="order-images">
                        {orderDetails[order.invoiceNum] &&
                          orderDetails[order.invoiceNum].map((item) => {
                            const imageSrc =
                              productImages[item.product?.image_url] || productImages["default.jpg"];
                            return (
                              <img key={item.productId} src={imageSrc} alt="Product" className="order-img" />
                            );
                          })}
                      </div>

                      <div className="order-info-container">
                        <div className="order-status">
                          <h3>
                            Order{" "}
                            {order.invoiceStatus == 4 ? (
                              <>
                                <b>delivered</b> <FaCheckCircle className="status-icon delivered" />
                              </>
                            ) : (
                              <>
                                <div className="order-status">
                                  <h3 className={
                                    order.invoiceStatus == 1 ? "Pending" :
                                      order.invoiceStatus == 2 ? "Confirm" :
                                        order.invoiceStatus == 3 ? "Dispatched" :
                                          order.invoiceStatus == 4 ? "Delivered" :
                                            order.invoiceStatus == 5 ? "Rejected" :
                                              order.invoiceStatus == 6 ? "Cancelled" : ""
                                  }>
                                    {order.invoiceStatus == 1 ? "Pending" :
                                      order.invoiceStatus == 2 ? "Confirmed" :
                                        order.invoiceStatus == 3 ? "Dispatched" :
                                          order.invoiceStatus == 4 ? "Delivered" :
                                            order.invoiceStatus == 5 ? "Rejected" :
                                              order.invoiceStatus == 6 ? "Cancelled" : ""}
                                  </h3>
                                </div>
                              </>
                            )}
                          </h3>
                        </div>

                        <h3 className="order-amount">₹{order.invoiceTotalAmount}</h3>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='profile-detail'>
                  <h1 style={{ fontSize: '1.5rem', color: 'red' }}>
                    NO ORDER YET!
                  </h1>
                </div>
              )}
            </div>

            {paginatedOrders.length > 0 && (

              <div className="pagination">
                <span>Showing {startIndex + 1} to {Math.min(endIndex, orderList.length)} of {orderList.length} entries</span>

                {/* Previous Button */}
                <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>
                  &lt;
                </button>

                {/* First Page */}
                {/* {startPage > 1 && (
                <>
                  <button onClick={() => handlePageClick(1)}>1</button>
                  {startPage > 2 && <span>...</span>}
                </>
              )} */}

                {/* Dynamic Page Numbers */}
                {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
                  <button
                    key={startPage + index}
                    className={currentPage === startPage + index ? "active" : ""}
                    onClick={() => handlePageClick(startPage + index)}
                  >
                    {startPage + index}
                  </button>
                ))}

                {/* Last Page */}
                {/* {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && <span>...</span>}
                  <button onClick={() => handlePageClick(totalPages)}>{totalPages}</button>
                </>
              )} */}

                {/* Next Button */}
                <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>
                  &gt;
                </button>
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
