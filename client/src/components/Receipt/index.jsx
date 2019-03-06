'use strict'

import React, { Component } from 'react';
import Moment from 'react-moment';
import './styles.sass'

class Receipt extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fiatValue: this.props.fiatValue,
            digitalValue: this.props.digitalValue,
            expiry: this.props.expiry,
            invoiceID: this.props.invoiceID,
            shareableURL: this.props.shareableURL,
            shareMsg: "Share Invoice!",
        }

        this.shareLink = this.shareLink.bind(this)
    }

    // formats fiat currency and returns it
    fiatFormat() {
        let fiat = this.state.fiatValue 
        fiat = fiat/100
        fiat = fiat.toFixed(2)
        return fiat
    }

    // formats bitcoin to BTC format
    bitcoinFormat() {
        let bitcoin = this.state.digitalValue;
        bitcoin = bitcoin/100000000;
        return bitcoin
    }
    
    shareLink(){
        var textArea = document.createElement("textarea");
        textArea.value = this.state.shareableURL;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        this.setState({shareMsg: "Copied!"})
    }

    render() {
        return (
            <div>
                <div className='receipt'>
                <div className='title'>Invoice</div>
                <div className="expiration">Expiration {<Moment interval={1000} unix fromNow>{this.state.expiry}</Moment>}</div>
                <div>
                    <div className='line'>
                    <div className='name'>Bitcoin</div>
                    <div className='value'>{this.bitcoinFormat()}</div>
                    </div>
                    <div className='line'>
                    <div className='name'>Fiat</div>
                    <div className='value'>${this.fiatFormat()}</div>
                    </div>
                    <div className='line'>
                    <div className='name'>Address</div>
                    <div className='value'>{this.state.invoiceID}</div>
                    </div>
                    <div className='line'>
                    <div className='name'>Remaining</div>
                    <div className='value'>{this.props.digitalValueRemaining/100000000}</div>
                    </div>
                    <div className='line'>
                    <button className="share" onClick={this.shareLink}>{this.state.shareMsg}</button>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}

export default Receipt