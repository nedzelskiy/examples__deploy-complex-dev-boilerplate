'use strict';

import React from 'react';
import {connect} from 'react-redux';

const Root: React.StatelessComponent<any> = (props): JSX.Element => (
    <h4>{ props.message }</h4>
    <button></button>
);

const mapDispatchToProps = (dispatch: any) => ({

});

const mapStateToProps = (state: any) => ({
    message: 'Hello world!'
});

export default connect<any, any, {}>(mapStateToProps, mapDispatchToProps)(Root);