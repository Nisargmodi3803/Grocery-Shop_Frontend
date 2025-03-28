import React, { useState, useEffect } from 'react'
import './ViewOrder.css'
import { useParams } from 'react-router-dom'
import { useLoading } from '../Context/LoadingContext'
import axios from 'axios'
import { FaPhoneAlt } from "react-icons/fa";
import { HiMiniMinusSmall } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom'
import companyLogo from '../assets/Logo/060622034612bits.png';
import { ProductReview } from './ProductReview'

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const Company = importAll(require.context("../assets/Logo", false, /\.(png|jpeg|svg|jpg|JPEG)$/));
const productImages = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));


export const ViewOrder = () => {
    const [orderList, setOrderList] = useState({});
    const [orderDetails, setOrderDetails] = useState([]);
    const { invoiceNum } = useParams();
    const { setLoading } = useLoading();
    const [customer, setCustomer] = useState({});
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [reviewProductId, setReviewProductId] = useState(null);
    const [reviewInvoiceId, setReviewInvoiceId] = useState(null);

    const fetchCustomerDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/customer-email/${sessionStorage.getItem("customerEmail")}`);

            if (response.status === 200) {
                setCustomer(response.data);
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

    useEffect(() => {
        if (!sessionStorage.getItem("isAuthenticated")) {
            navigate("/ecommerce/");
        }
    }, []);

    const fetchOrderList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/order/${invoiceNum}`);
            if (response.status === 200) {
                setOrderList(response.data || {}); // Ensure it's always an object
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("Customer not found");
            } else {
                console.error("Error fetching customer details:", error);
                alert("Something went wrong in fetching Customer Details. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (invoiceId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/product-order/${invoiceId}`);
            if (response.status === 200) {
                return response.data; // Return fetched order details
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("Order not found for invoice:", invoiceId);
            } else {
                console.error("Error fetching order details:", error);
                alert("Something went wrong in fetching order details. Please try again!");
            }
        } finally {
            setLoading(false);
        }
        return []; // Return an empty array if an error occurs
    };

    const fetchDetails = async () => {
        if (!orderList?.invoiceId) return; // Ensure orderList has data before proceeding

        try {
            const response = await fetchOrderDetails(orderList.invoiceId); // Await API response
            setOrderDetails({ [orderList.invoiceNum]: response }); // Store using invoiceNum as key
        } catch (error) {
            console.error(`Error fetching details for ${orderList.invoiceNum}:`, error);
        }
    };

    // Fetch order list when the component mounts
    useEffect(() => {
        fetchOrderList();
        fetchCustomerDetails();
    }, []);

    // Fetch order details when orderList is updated
    useEffect(() => {
        if (Object.keys(orderList).length > 0) { // Ensure orderList is not empty
            fetchDetails();
        }
    }, [orderList]);


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

    const calculateTotalMrp = () => {
        if (!orderDetails[invoiceNum] || !Array.isArray(orderDetails[invoiceNum])) return 0;

        return orderDetails[invoiceNum].reduce((acc, item) => acc + item.mrp * item.quantity, 0);
    };

    const calculateDiscount = () => {
        if (!orderDetails[invoiceNum] || !Array.isArray(orderDetails[invoiceNum])) return 0;

        const totalDiscount = orderDetails[invoiceNum].reduce((acc, item) => acc + item.totalAmount * item.quantity, 0);

        return calculateTotalMrp() - totalDiscount;
    };

    const calculateNetAmount = () => {
        return calculateTotalMrp() - calculateDiscount();
    };

    const calculateTotalPointsAmt = () => {
        return customer?.customerPoint ? Math.floor(customer.customerPoint * 0.1) : 0;
    };

    const calculateDiscountPointPrice = () => {
        return calculateNetAmount() - calculateTotalPointsAmt();
    };

    const calulateCouponDiscountAmt = () => {
        return calculateDiscountPointPrice() - (orderList?.invoiceCouponCodeDiscount || 0);
    };

    const deliveryCharge = () => {
        return calulateCouponDiscountAmt() < 500 ? 15 : 0;
    };

    const calculateTotalPayable = () => {
        return calulateCouponDiscountAmt() + deliveryCharge();
    };

    const handleInvoicePrint = () => {
        const logoUrl = "https://bitsinfotech.in/ecommerce/fmcg_upload/logo/060622034612bits.png";

        // Preload the image
        const img = new Image();
        img.src = logoUrl;
        img.onload = () => {
            let printContent = `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 10px;">
                      <img src="${logoUrl}" alt="Company Logo" style="width: 120px; height: auto; margin-bottom: 10px;"/>
                      <h2 style="margin: 0;">Bits Infotech</h2>
                      <p style="margin-top: 5px;">INVOICE - BI-${orderList.invoiceNum}</p>
                  </div>
                  <hr />
                  <p><strong>Name:</strong> ${orderList.invoiceName}</p>
                  <p><strong>Mobile:</strong> ${orderList.invoiceMobile}</p>
                  <p><strong>Date:</strong> ${orderList.invoiceDate}</p>
                  <hr />
                  <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 20px;">
                      <thead>
                          <tr>
                              <th>#</th>
                              <th>Item Description</th>
                              <th>Quantity</th>
                              <th>MRP</th>
                              <th>Discount</th>
                              <th>Product Price</th>
                              <th>Net Amount</th>
                          </tr>
                      </thead>
                      <tbody>
            `;

            orderDetails[invoiceNum].forEach((item, index) => {
                printContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.mrp}</td>
                    <td>₹${item.mrp - item.totalAmount}</td>
                    <td>₹${item.totalAmount}</td>
                    <td>₹${item.quantity * item.totalAmount}</td>
                </tr>
              `;
            });

            printContent += `
                      </tbody>
                  </table>
                  <div style="margin-top: 20px; text-align: right;">
                      <p><strong>Sub Total:</strong> ₹${calulateCouponDiscountAmt()}</p>
                      <p><strong>Delivery Charges:</strong> ₹${deliveryCharge()}</p>
                      <h3><strong>Total Amount:</strong> ₹${calculateTotalPayable()}</h3>
                  </div>
                  <p style="text-align: center; margin-top: 30px; font-weight: bold;">THANK YOU!</p>
              </div>
            `;

            const newWin = window.open('', '', 'width=900,height=700');
            newWin.document.write(`
                <html>
                    <head>
                        <title>Invoice Print</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                            th { background-color: #f0f0f0; }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                </html>
            `);
            newWin.document.close();

            setTimeout(() => {
                newWin.focus();
                newWin.print();
                newWin.close();
            }, 100); // Give some time for image to load
        };
    };

    const handleReviewClick = (productId, invoiceId) => {
        setReviewProductId(productId);
        setReviewInvoiceId(invoiceId);
        setShowModal(true); // Open Modal

    };

    const closeModal = () => {
        setShowModal(false);
        setReviewProductId(null);
    };

    return (
        <div className='view-order'>
            <div className='order'>
                <div className='order-details-products'>
                    <div className='product-counts'>
                        <span>
                            {orderDetails[invoiceNum]?.length} {orderDetails[invoiceNum]?.length === 1 ? "Product" : "Products"}
                        </span>
                    </div>

                    {orderDetails[invoiceNum] &&
                        orderDetails[invoiceNum].map((product) => {
                            const imageSrc = productImages[product.product?.image_url] || `http://localhost:9000/uploads/${product.product.image_url}` || productImages["default.jpg"];
                            return (
                                <div className='order-details1'>
                                    <div
                                        className='order-details-image'
                                        onClick={() => {
                                            navigate(`/ecommerce/product/${product.product?.slug_title}`);
                                        }}
                                    >
                                        <img src={imageSrc} alt="Product" />
                                    </div>
                                    <div className='order-details-info'>
                                        <div
                                            className='order-details-info-title'
                                            onClick={() => {
                                                navigate(`/ecommerce/product/${product.product?.slug_title}`);
                                            }}
                                        >
                                            <span>
                                                {product.productName} - {product.productVariantName}
                                            </span>
                                        </div>

                                        <div className='order-details-info-price'>
                                            <span>
                                                ₹{product.totalAmount * product.quantity}
                                            </span>
                                        </div>

                                        <div className='order-details-info-quantity'>
                                            <span>
                                                Quantity : {product.quantity}
                                            </span>
                                        </div>

                                        {orderList.invoiceStatus == 4 ? (
                                            <div className='review-button-section'>
                                                <div className='review-button'
                                                    onClick={() => handleReviewClick(product.product?.id, product.invoice.invoiceId)}>Add Review</div>
                                            </div>
                                        ) : ""}
                                    </div>
                                </div>
                            )
                        })}

                </div>

                <div className='order-details-address-mrp'>
                    <div className='order-number-title'>
                        <div className='order-no'>
                            <span>Order Number</span>
                            <span>{orderList.invoicePrefix}{orderList.invoiceNum}</span>
                        </div>
                        <p className="order-date">
                            Placed at {formatDateTime(orderList.invoiceDate, orderList.invoiceTime)}
                        </p>
                        {
                            orderList.invoiceDeliveryDate && orderList.invoiceStatus === 3 &&(
                                <p className="order-date" style={{ color: "blue" }}>
                                    Expected Delivery Date {orderList.invoiceDeliveryDate}
                                </p>
                            )
                        }
                        {
                            orderList.invoiceDeliveryDate && orderList.invoiceStatus === 4 &&(
                                <p className="order-date" style={{ color: "green" }}>
                                    Order Delivered on {orderList.invoiceDeliveryDate}
                                </p>
                            )
                        }
                        <div className="order-details-status">
                            <span className={
                                orderList.invoiceStatus == 1 ? "Pending" :
                                    orderList.invoiceStatus == 2 ? "Confirm" :
                                        orderList.invoiceStatus == 3 ? "Dispatched" :
                                            orderList.invoiceStatus == 4 ? "Delivered" :
                                                orderList.invoiceStatus == 5 ? "Rejected" :
                                                    orderList.invoiceStatus == 6 ? "Cancelled" : ""
                            }>
                                {orderList.invoiceStatus == 1 ?
                                    "Your Order has been Pending" :
                                    orderList.invoiceStatus == 2 ?
                                        "Your Order has been Confirmed" :
                                        orderList.invoiceStatus == 3 ?
                                            "Your Order has been Dispatched" :
                                            orderList.invoiceStatus == 4 ?
                                                "Your Order has been Delivered" :
                                                orderList.invoiceStatus == 5 ?
                                                    "Your Order has been Rejected" :
                                                    orderList.invoiceStatus == 6 ?
                                                        "Your Order has been Cancelled" : ""}
                            </span>
                        </div>
                    </div>

                    <div className='order-details-address'>
                        <h3>Delivery Address</h3>
                        <div className='order-details-address-info'>
                            <h3>{orderList.invoiceName}</h3>
                            <p>{orderList.invoiceAddress}</p>
                            <span><FaPhoneAlt /> {orderList.invoiceMobile}</span>
                        </div>
                    </div>

                    <div className='order-details-mrp'>
                        <div className='order-details-mrp-price'>
                            <p>MRP</p>
                            <span>₹{calculateTotalMrp()}</span>
                        </div>

                        <div className='order-details-mrp-price'>
                            <p>DISCOUNT</p>
                            <span><HiMiniMinusSmall />₹{calculateDiscount()}</span>
                        </div>

                        <div className='order-details-mrp-price'>
                            <p>NET AMOUNT</p>
                            <span>₹{calculateNetAmount()}</span>
                        </div>

                        <div className='order-details-mrp-price'>
                            <p>DISCOUNT POINTS</p>
                            <span><HiMiniMinusSmall />₹{calculateTotalPointsAmt().toFixed(2)}</span>
                        </div>

                        <div className='order-details-mrp-price'>
                            <p>COUPON DISCOUNT</p>
                            <span>
                                <HiMiniMinusSmall />₹{(orderList.invoiceCouponCodeDiscount || 0).toFixed(2)}
                            </span>
                        </div>

                        <div className='order-details-mrp-delivery'>
                            <p>DELIVERY CHARGE</p>
                            <span>+₹{deliveryCharge().toFixed(2)}</span>
                        </div>

                        <div className='order-details-mrp-total'>
                            <p>TOTAL BILL AMONUNT</p>
                            <span>₹{calculateTotalPayable()}</span>
                        </div>
                        {
                            orderList.invoiceStatus == 4 ? (
                                <div className='print-invoice-section'>
                                    <div className='review-button' onClick={handleInvoicePrint}>Print Invoice</div>
                                </div>
                            ) : ""
                        }
                    </div>
                </div>
            </div>
            {showModal && <ProductReview closeModal={closeModal} productId={reviewProductId} invoiceId={reviewInvoiceId} />}
        </div >

    )
}