import React from 'react'
import './ViewOrder.css'
import { useParams } from 'react-router-dom'

export const ViewOrder = () => {
    const { invoiceNum } = useParams();
    return (
        <div className='view-order'>
            <h1>View Order BI - {invoiceNum}</h1>
        </div>
    )
}