import { createSelector } from 'reselect';

export const listPOIsSelector = createSelector(
  state => state.map.activeView.category,
  state => state.map.activeView.boxes,
  state => state.map.boxes,
  state => state.map.pois,
  (activeCategory, activeBoxes, boxes, pois) => {
    const ret = [];
    activeBoxes.forEach(hash => {
      (boxes[hash] || []).forEach(poiHash => {
        const poi = pois[poiHash];
        if (poi.category === activeCategory) {
          ret.push(poi);
        }
      });
    });
    return ret;
  }
);
