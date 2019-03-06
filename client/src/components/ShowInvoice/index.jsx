'use strict'

import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import {InvoiceGetRequest, InvoiceCheckRequest} from "../../protobuf/invoice_pb.js";
import {InvoiceClient} from "../../protobuf/invoice_grpc_web_pb.js";
import './styles.sass'
import Error from '../Error/index.jsx';
import Receipt from '../Receipt/index.jsx';
import Paid from '../Paid/index.jsx';
import OverPaid from '../OverPaid/index.jsx';

class ShowInvoice extends Component {
    constructor(props) {
        super(props)
        this.state = {
            invoiceID: this.props.match.params.id, 
            loading: true,
            status: "unpaid",
            shareableURL: `localhost:8081/invoice/${this.props.match.params.id}`,
            error: null,
        }

        this.isPaid = this.isPaid.bind(this)
        this.isOverPaid = this.isOverPaid.bind(this)
        this.isExpired = this.isExpired.bind(this)
    }

    // getInvoiceRequest will get invoice from backend
    getInvoiceRequest(){
        const client = new InvoiceClient('http://localhost:8080');
        const invoice = new InvoiceGetRequest();
        invoice.setInvoiceId(this.state.invoiceID);
        return new Promise((resolve,reject) => {client.getInvoice(invoice, {}, (err, response) => {
            if (err) {
                console.log(err.message);
                this.setState({error: err.message});
                reject(false);
            } else {
                // load invoice into state
                this.setState({             
                    fiatValue: response.getFiatvalue(),
                    digitalValue: response.getDigitalvalue(),
                    expiry: response.getExpiry(),
                    invoiceID: response.getInvoiceId(),
                    shareableURL: `localhost:8081/invoice/${this.state.invoiceID}`,
                })
                resolve(true);
            }
        })});
    }

    // checkInvoice will request a status update on a given invoice
    checkInvoice(){
        const client = new InvoiceClient('http://localhost:8080');
        const invoice = new InvoiceCheckRequest();
        invoice.setInvoiceId(this.state.invoiceID)
        return new Promise((resolve,reject) => {client.checkInvoice(invoice, {}, (err, response) => {
            if (err) {
                console.log(err.message);
                this.setState({error: err.message});
                reject(false)
            } else {
                this.setState({             
                    status: response.getStatus(),
                    digitalValueRemaining: response.getDigitalvalueremaining(),
                })
                resolve(response.getStatus())
        }})});
    }
    
    // componentDidMount will call getinvoice and check its status
    componentDidMount(){
        // get the invoice request
        this.getInvoiceRequest().then(success => {
            if (success) {
                // remove loading screen
                this.setState({loading: false});
                try {
                    // load the status of the invoice into state
                    this.checkInvoice();
                } catch(e) {
                    this.setState({loading: true});
                }
                try {
                    // keep checking that the request is paid
                    setInterval(async () => {
                        this.checkInvoice().then(res => {
                            if (res == "paid") {
                                return Promise.resolve(res)
                            } 
                            if (res == false) {
                                return Promise.reject(res)
                            }
                        })
                    }, 10000);
                } catch (e) {
                    // display error
                    this.setState({loading: true});
                }
            }
        });
    }

    // check if invoice is expired
    isExpired(){
        if (this.state.status == "expired") {
            return true;
        }
        return false;
    }

    // checks for errors
    isError(){
        if (this.state.error != null) {
            return true;
        }
        return false;
    }

    isOverPaid(){
        if (this.state.status == "over_paid") {
            return true;
        }
        return false;
    }

    isPaid() {
        if(this.state.status == "paid") {
            return true;
        }
        return false;
    }

    render() {

        if (this.isOverPaid()) {
            return(<OverPaid/>)
        } else if (this.isPaid()) {
            return(<Paid/>)
        } else {
            return (
                this.state.error ? (
                    <Error errorMessage={this.state.error}/>
                ) : ( 
                    this.state.loading ? (
                        <div className="notFoundMsg"> Invoice not found! </div>
                        ) : (
                            this.isExpired() ? (
                                <div className="notFoundMsg"> Expired! </div>
                            ) : (
                                <div className="showInvoice">
                                    <div className="qrCode">
                                        <QRCode includeMargin={false} level={'L'} size={250} value={this.state.invoiceID} />
                                    </div>
                                    <div>
                                        <Receipt {...this.props} {...this.state}></Receipt>
                                    </div>
                                </div>
                            )
                        )
                    )
                )
        }
    }
}

export default ShowInvoice