import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from 'reducers';
import * as asyncInitialState from 'redux-async-initial-state';
import loadStore from './load';
import { createHashHistory } from 'history';

const storeCreator = asyncInitialState.middleware(getState =>
  loadStore.load(getState)
);

export const store = createStore(
  reducer,
  compose(applyMiddleware(thunk, storeCreator)) /// storeCreator should come last so dispatch works well i.e. returns promises
);

export const basename = '/';

export const history = createHashHistory({ basename });

window.shistory = history;
window.sstore = window.store = store;

store.dispatch({ type: 'noop' });

export default store;
