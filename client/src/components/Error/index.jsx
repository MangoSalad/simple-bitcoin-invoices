import React, { Component } from 'react'
import './styles.sass'

class Error extends Component {
  constructor() {
    super()
  }

  render() {
    return (
        <div className="error">
            <h1>            
                Opps. Something happened!
            </h1>
            <div className='subtitle'>
                {this.props.errorMessage}
            </div>
        </div>
    )
  }
}

export default Error