import _ from 'lodash';
import clone from 'utils/clone';
import { ACTION_TYPE_UPDATE_DATA } from 'config';

const DEFAULT_STATE = {
  boxes: {},
  pois: {},

  activeView: {
    isLoading: true,
    category: 0,
    boxes: [],
  },

  addPOI: {
    isAdding: false,
  },

  viewPOI: {
    isLoading: false,
  },
};

export default (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case ACTION_TYPE_UPDATE_DATA: {
      const s = clone(state);
      for (const k in action.payload) {
        if (action.payload.hasOwnProperty(k)) {
          s[k] = _.assign(s[k], action.payload[k]);
        }
      }
      return s;
    }

    default:
      return state;
  }
};
