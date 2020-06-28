import cache from 'utils/cache';
import { ACTION_TYPE_TOGGLE_THEME } from 'config';
import map from 'map';
import { history } from 'utils/store';

export function toggleTheme() {
  return async (dispatch, getState) => {
    dispatch({ type: ACTION_TYPE_TOGGLE_THEME });
    cache('theme', getState().app.theme);
    map.updateStyle();
  };
}

export function navigate(payload) {
  return async (dispatch, getState) => {
    history.push(payload);
  };
}

export function goHome(payload) {
  return async (dispatch, getState) => {
    dispatch(navigate('/'));
  };
}
