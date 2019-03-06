import React, { Component } from 'react';
import './styles.sass'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

// mask for input
const numberMask = createNumberMask({
  prefix: '$',
  includeThousandsSeparator: true,
  allowDecimal: true,
  decimalLimit: 2,
  integerLimit: 5
})

class CreateInvoice extends Component {
    constructor(props) {
    super(props)
    this.state = {
        fiatValue: 0
    }

    this.createInvoice = this.props.handleSubmit.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    }

    // handleSubmit creates invoice when submit is pressed
    handleSubmit(event) {
        event.preventDefault()
        if (this.state.fiatValue > 0) {
            this.createInvoice(this.state.fiatValue)
        }
    }

    // cleans up the number
    handleChange(event) {
        let value = event.target.value
        // clean up number. No floats.
        value = value.slice(1)
        value = value.replace(/,/g, '')
        value = value * 100
        value = Math.round(value)
        this.setState({fiatValue: value})
    }

    render() {
        return (
            <div>
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <MaskedInput
                                mask={numberMask}
                                className="invoiceAmount"
                                placeholder='$0'
                                guide={false}
                                value={this.props.value || ''}
                                id="digitalAmount"
                                onChange={this.handleChange}/>
                        </div>
                        <div>
                            <button variant="success" className="generateInvoiceButton">Generate Invoice!</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default CreateInvoice