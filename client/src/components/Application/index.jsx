import React, { Component } from 'react';
import {BrowserRouter,Route,Switch,Redirect} from 'react-router-dom';

import Header from '../Header/index.jsx';
import Footer from '../Footer/index.jsx';
import Error from '../Error/index.jsx';
import CreateInvoice from '../CreateInvoice/index.jsx';
import ShowInvoice from '../ShowInvoice/index.jsx';
import {InvoiceRequest} from "../../protobuf/invoice_pb.js";
import {InvoiceClient} from "../../protobuf/invoice_grpc_web_pb.js";

class Application extends Component {
	constructor(props) {
		super(props)
		this.state = {
			redirectURL: '',
			redirect: false,
			error: null
		}
	}

	// createInvoiceRequest creates a new invoice request and returns a promise
	createInvoiceRequest(fiatValue){
		const client = new InvoiceClient('http://localhost:8080');
		const invoice = new InvoiceRequest();
		invoice.setValue(fiatValue)
		return new Promise((resolve,reject) => {client.createInvoice(invoice, {}, (err, response) => {
			if (err) {
				console.log(err.message);
				this.setState({error: err.message})
				reject(false)
			} else {
				this.setState({             
					fiatValue: response.getFiatvalue(),
					digitalValue: response.getDigitalvalue(),
					expiry: response.getExpiry(),
					invoiceID: response.getInvoiceId(),
				})
				resolve(true)
			}
			}) 
		});
	}

	// handles submit of new invoice
	handleSubmit(fiatValue) {
		this.createInvoiceRequest(fiatValue).then(success => {
			if (success) {
				// redirect to the invoice payment
				this.setState({redirect: true})
				this.setState({redirectURL: "/invoice/"+this.state.invoiceID})
			}
		})
	}

	// if invoice generation successful, redirect to invoice page
	shouldRedirect() {
		return this.state.redirect
	}

	// checks for errors
    isError(){
        if (this.state.error != null) {
            return true;
        }
        return false;
    }

	render() {
		if (this.isError()) {
			return (<div><Header/><Error errorMessage={this.state.error}/><Footer/></div>)
		}
		return (
			<div>
				<Header/>
					<BrowserRouter>
						<Switch>
							<Route exact path="/" render={() => (
								this.shouldRedirect() ? 
									( 
										<Redirect to={this.state.redirectURL}/>
									) : (
										<CreateInvoice handleSubmit={this.handleSubmit.bind(this)}/>
									))}/>
							<Route exact path="/invoice/:id" render={(props)=> <ShowInvoice {...props} {...this.state}/>} />
							<Route path="/" render={()=> <Error errorMessage="Cannot find the resource you are requesting."></Error>} />
						</Switch>
					</BrowserRouter> 
				<Footer/>
			</div>
		)
	}
}

export default Application;