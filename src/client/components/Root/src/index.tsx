'use strict';

import * as React from 'react';
import { connect } from 'react-redux';
import { getCurrentDate } from './actions';
import Counter from '../../Counter/src';

export const Root: React.StatelessComponent<any> = (props): JSX.Element => (
    <div>
        { (() => {(window as any).props = props; (window as any).t = Root })() }
        <h4>{ props.message }</h4>
        <div>{ props.date.toString() }</div>
        <Counter />
    </div>
);

const mapDispatchToProps = (dispatch: any) => ({
    getCurrentDate: getCurrentDate.bind({ dispatch: dispatch })
});

const mapStateToProps = (state: any) => ({
    message: 'And this is a counter for present React boilerplate!',
    date: state.Root
});

export default connect<any, any, {}>(mapStateToProps, mapDispatchToProps)(Root);