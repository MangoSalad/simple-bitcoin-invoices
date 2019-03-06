import React, { Component } from 'react'
import './styles.sass'

class OverPaid extends Component {
  constructor() {
    super()
  }

  render() {
    return (
        <div className="overpaid">
            <h1>            
                Looks like you overpaid!
            </h1>
            <div className='subtitle'>
                Contact the merchant for help.
            </div>
        </div>
    )
  }
}

export default OverPaid