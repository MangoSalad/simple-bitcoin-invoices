import React from 'react';
import './styles.sass'

export default () => (
    <header>
        <div onClick={()=>{window.location.assign("/")}} className="title">Simple Bitcoin Invoices</div>
    </header>
)