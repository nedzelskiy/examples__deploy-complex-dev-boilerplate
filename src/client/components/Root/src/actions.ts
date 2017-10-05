'use strict';

import { IAction } from './reducer'

export interface IDispatch {
    (param: IAction): void;
}

export const getCurrentDate = function (): void {
    let dispatch: IDispatch = this.dispatch;
    dispatch({ type: 'GET_CURRENT_DATE'});
};