import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import Application from './components/Application/index.jsx';

ReactDOM.render(<Application />, document.getElementById('root'));
serviceWorker.unregister();
