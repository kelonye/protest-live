import { ACTION_TYPE_UPDATE_DATA } from 'config';
import near from 'utils/wallet';
import map from 'map';
import geohash from 'latlon-geohash';
import clone from 'utils/clone';

export function updateData(payload) {
  return { type: ACTION_TYPE_UPDATE_DATA, payload };
}

export function setIsAddingPOI(isAdding) {
  return async (dispatch, getState) => {
    dispatch(updateData({ addPOI: { isAdding } }));
    map.updateCursor(isAdding ? 'crosshair' : '');
  };
}

export function createPOI(info) {
  return async (dispatch, getState) => {
    dispatch(updateData({ addPOI: { isSyncing: true } }));
    const { contract } = near();
    await contract.register_poi(info);

    const hash = geohash.encode(info.lat, info.lng);
    const boxHash = geohash.encode(info.lat, info.lng, 5);

    const poi = {
      ...info,
      hash,
    };
    map.boxMarkers[poi.hash] = map.boxMarkers[poi.hash] || [];
    map.boxMarkers[poi.hash].push(map.makePOIMarker(poi));
    const { map: mapState } = getState();
    const boxes = clone(mapState.boxes);
    const pois = clone(mapState.pois);
    boxes[boxHash] = boxes[boxHash] || [];
    boxes[boxHash].push(poi.hash);
    pois[poi.hash] = poi;
    dispatch(updateData({ pois, boxes, addPOI: { isSyncing: false } }));
  };
}

export function viewPOI({ hash, lng, lat }) {
  return async (dispatch, getState) => {
    const {
      map: { pois },
    } = getState();
    let poi = pois[hash];
    if (!poi) {
      dispatch({
        type: ACTION_TYPE_UPDATE_DATA,
        payload: { viewPOI: { isLoading: true } },
      });
      const { contract } = near();
      poi = await contract.get_poi({
        lng,
        lat,
      });
    }
    dispatch({
      type: ACTION_TYPE_UPDATE_DATA,
      payload: { viewPOI: { hash, isLoading: false } },
    });
  };
}
