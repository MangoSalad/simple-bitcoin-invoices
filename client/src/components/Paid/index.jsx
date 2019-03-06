import React, { Component } from 'react'
import './styles.sass'

class Paid extends Component {
  constructor() {
    super()
  }

  render() {
    return (
        <div className="paid">
            <h1>            
                Invoice Paid!
            </h1>
        </div>
    )
  }
}

export default Paid