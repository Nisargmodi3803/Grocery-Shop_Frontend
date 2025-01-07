import React from 'react'
import './Blog.css'
import BlogCard from './BlogCard';

export const Blog = () => {
  return (
    <>
      <div className='blog'>
        <section className='container-title'>
          <h1>Blog</h1>
        </section>
        <BlogCard/>
      </div>
    </>

  )
}
