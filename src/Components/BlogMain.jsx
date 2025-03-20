import React, { useEffect, useState } from 'react'
import './BlogMain.css'
import axios from 'axios';
import { useLoading } from '../Context/LoadingContext';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { FaCalendarDay } from "react-icons/fa";
import DOMPurify from 'dompurify';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Blog", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const BlogMain = () => {
    const { blogSlugTitle } = useParams();
    const [Allblogs, setAllBlogs] = useState([]);
    const [blog, setBlog] = useState({});
    const { setLoading } = useLoading();
    const navigate = useNavigate();

    const fetchAllBlogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:9000/blogs");
            if (response.status === 200) {
                setAllBlogs(response.data);
            }
        } catch (error) {
            if (error.response.status === 404) {
                setAllBlogs([]);
                console.log("No Blogs Found");
            } else {
                console.error("Error fetching blogs:", error);
                alert("Something went wrong in fetching All Blogs. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchBlog = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:9000/blog-slug/${blogSlugTitle}`);
            if (response.status === 200) {
                setBlog(response.data);
            }
        } catch (error) {
            if (error.response.status === 404) {
                console.log("No Blog Found");
            } else {
                console.error("Error fetching blog:", error);
                alert("Something went wrong in fetching Blog. Please try again!");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllBlogs();
        fetchBlog();
    }, []);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 1000);

        return () => clearTimeout(timer);
    }, [setLoading]);

    return (
        <div className='blog-main'>
            <div className='blog-content1'>
                <div className='blog-content-section'>
                    <div className='blog-content-image'>
                        <img
                            src={imageMap[blog.image_url] || `http://localhost:9000/uploads/${blog.image_url}` || imageMap["default.jpg"]}
                            alt="Blog"
                        />
                    </div>
                    <div className='blog-content-title'>
                        <h3>{blog.title}</h3>
                    </div>
                    <div className='blog-content-date'>
                        <span>
                            <FaCalendarDay /> {blog.date}
                        </span>
                    </div>
                    <div className='blog-content-description'>
                        <p>{blog.description}</p>
                    </div>
                    <div className='blog-content-long-description'>
                        <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.long_description) }}></p>
                    </div>
                </div>

                <div className='blog-side-section'>
                    <div className='blog-side-title'>
                        <h3>Popular Post</h3>
                    </div>
                    <div className='blog-side-content'>
                        {Allblogs.map((b) => (
                            <>
                                {/* <div className='blog-side-content-item-title'>
                                    <h6>{blog.title}</h6>
                                </div> */}
                                <div className={`${b.title === blog.title ? "blog-side-content-item-title-active" : "blog-side-content-item-title"}`}
                                    onClick={() => {
                                        navigate(`/ecommerce/blog/${b.slug_title}`);
                                        // window.location.reload();
                                    }}>
                                    <h6>{b.title}</h6>
                                </div>
                                <div className='blog-side-content-item-date'>
                                    <span>
                                        <FaCalendarDay /> {b.date}
                                    </span>
                                </div>
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
