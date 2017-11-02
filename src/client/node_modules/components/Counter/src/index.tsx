'use strict';

import './styles.scss';
import * as React from 'react';

interface IProps {
    readonly increment: () => void;
    readonly decrement: () => void;
}

export default class Counter extends React.PureComponent<any, any> {
    render() {
        return (
            <div className = { this.constructor.name }>
                <button onClick={this.props.increment} className="increment">+</button>
                <button onClick={this.props.incrementAsync} className="incrementAsync">+ (∞)</button>
                <button onClick={this.props.decrement} className="decrement">−</button>
                <button onClick={this.props.decrementAsync} className="decrementAsync">− (∞)</button>
            </div>
        )
    }
}