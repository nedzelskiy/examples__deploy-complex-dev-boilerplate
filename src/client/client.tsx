'use strict';

import React from 'react';
import store from './store';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

ReactDOM.render(
    <Provider store = {store}>
        <div>Hello</div>
    </Provider>,
    document.querySelector('#root')
);

