import compose from 'utils/compose';
import cache from 'utils/cache';
import LoadData from './data';
import MatchLocationPath from './match-location-path';

class Init {
  async load(getState) {
    this.state = getState();
    try {
      await this.loadData();
      await this.matchLocationPath();
    } catch (error) {
      this.state.app.error = error;
    }
    this.state.app.isLoaded = true;
    this.state.app.debug = !!cache('debug');
    return this.state;
  }
}

class Store extends compose([Init, LoadData, MatchLocationPath]) {}

export default new Store();
