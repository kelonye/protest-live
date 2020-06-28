import { combineReducers } from 'redux';
import * as asyncInitialState from 'redux-async-initial-state';
import app from './app';
import map from './map';
import wallet from './wallet';

export default asyncInitialState.outerReducer(
  combineReducers({
    app,
    map,
    wallet,
    asyncInitialState: asyncInitialState.innerReducer, // last
  })
);
