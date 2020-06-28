import _ from 'lodash';
import Promise from 'bluebird';
import mapboxgl from 'mapbox-gl';
import geohash from 'latlon-geohash';
import * as actions from 'actions';
import {
  DEFAULT_LOCATION,
  MAPBOX_ACCESS_TOKEN,
  POI_CATEGORIES,
  SECONDARY_COLOR,
} from 'config';
import cache from 'utils/cache';
import store from 'utils/store';
import near from 'utils/wallet';
import clone from 'utils/clone';
import pinSVG from './pin';

const debug = !!cache('debug');

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const map = (window.map = new (class {
  constructor() {
    this.boxMarkers = {};
    _.bindAll(this, ['addGeohashBlock', 'removeGeohashBlock']);
  }

  render(container) {
    const { latitude, longitude, zoom, bearing, pitch } =
      cache('location') || DEFAULT_LOCATION;

    const map = (this.map = new mapboxgl.Map({
      container,
      style: this.getStyle(),
      center: [longitude, latitude],
      zoom,
      pitch,
      bearing,
      minZoom: 11,
    }));

    map.on('load', async () => {
      this.onLoad();
      map.on('move', e => this.onMove(e));
      map.on('click', e => this.onClick(e));
    });
  }

  onLoad() {
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'bottom-right'
    );

    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    this.updateGeoHashBlocks();
  }

  onClick(event) {
    const {
      map: {
        addPOI: { isAdding },
      },
    } = store.getState();
    if (isAdding) {
      const {
        lngLat: { lng, lat },
      } = event;
      store.dispatch(actions.navigate(`/add-poi/${lng}/${lat}`));
      store.dispatch(actions.setIsAddingPOI(false));
      return;
    }
  }

  onMove(e) {
    const { lng: longitude, lat: latitude } = this.map.getCenter();
    const zoom = this.map.getZoom();
    const bearing = this.map.getBearing();
    const pitch = this.map.getPitch();

    cache('location', { latitude, longitude, zoom, bearing, pitch });

    this.updateGeoHashBlocks();
  }

  updateCursor(cursor) {
    this.map.getCanvas().style.cursor = cursor;
  }

  async updateGeoHashBlocks() {
    const { lng, lat } = this.map.getCenter();
    const hash = geohash.encode(lat, lng, 5);
    const neighbours = Object.values(geohash.neighbours(hash));
    const geohashes = neighbours.concat(hash);

    this.geohashesToAdd = _.difference(geohashes, this.geohashes);
    this.geohashesToRemove = _.difference(this.geohashes, geohashes);
    this.geohashes = geohashes;

    if (debug) {
      const features = Object.values(neighbours).map(
        this.getGeohashBlockFeature
      );

      const data = {
        type: 'FeatureCollection',
        features,
      };

      const id = 'geohash-blocks';
      const source = this.map.getSource(id);
      if (!source) {
        this.map.addSource(id, {
          type: 'geojson',
          data,
        });

        this.map.addLayer({
          id,
          type: 'fill',
          source: id,
          paint: {
            'fill-color': 'rgba(200, 100, 240, 0.4)',
            'fill-outline-color': 'rgba(200, 100, 240, 1)',
          },
        });
      } else {
        source.setData(data);
      }
    }

    await Promise.all([
      ...this.geohashesToAdd.map(this.addGeohashBlock),
      ...this.geohashesToRemove.map(this.removeGeohashBlock),
    ]);

    store.dispatch(
      actions.updateData({
        activeView: { isLoading: false, boxes: this.geohashes },
      })
    );
  }

  getGeohashBlockFeature(hash) {
    const { sw, ne } = geohash.bounds(hash);
    return {
      type: 'Feature',
      properties: {
        block: hash,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [ne.lon, ne.lat],
            [sw.lon, ne.lat],
            [sw.lon, sw.lat],
            [ne.lon, sw.lat],
            [ne.lon, ne.lat],
          ],
        ],
      },
    };
  }

  async addGeohashBlock(hash) {
    const loaded = hash in this.boxMarkers;

    console.log('mounting box(%s)', hash);

    const { contract } = near();
    const {
      map: { pois: poisMap, boxes: boxesMap },
    } = store.getState();

    const pois = loaded
      ? boxesMap[hash].map(h => poisMap[h])
      : await contract.query_pois({
          box_hash: hash,
        });

    let boxes;
    if (!loaded) {
      boxes = clone(boxesMap);
      boxes[hash] = [];
    }

    this.boxMarkers[hash] = pois.map(marker => {
      if (!loaded) {
        boxes[hash].push(marker.hash);
        pois[marker.hash] = marker;
      }

      return this.makePOIMarker(marker);
    });

    if (!loaded) {
      store.dispatch(
        actions.updateData({
          pois,
          boxes,
        })
      );
    }
  }

  async removeGeohashBlock(hash) {
    console.log('unmounting box(%s)', hash);

    const markers = this.boxMarkers[hash];
    if (markers && markers.length) {
      markers.forEach(m => m.remove());
      this.boxMarkers[hash] = [];
    }
  }

  getStyle() {
    const {
      app: { theme },
    } = store.getState();

    return `mapbox://styles/mapbox/${theme}-v10`;
  }

  updateStyle() {
    this.map.setStyle(this.getStyle());
  }

  showPOIBeingAdded(coordinates) {
    this.removePOIBeingAdded();

    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = pinSVG({ size: 20, fill: SECONDARY_COLOR });

    this.poiBeingAdded = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(this.map);
  }

  removePOIBeingAdded() {
    if (this.poiBeingAdded) {
      this.poiBeingAdded.remove();
    }
  }

  makePOIMarker({ hash, address, category }) {
    const icon = POI_CATEGORIES[category].icon;
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = icon;
    el.style = el.style + 'font-size:35rem;width:30px;text-align:center;';

    const popup = new mapboxgl.Popup({ closeButton: false }).setHTML(
      `
<div class="poi-popup flex flex--column">
<div>${address}</div>
<div class="flex flex--shrink flex--justify-center">
  <div class="map-popup-token flex flex--justify-center flex--align-center">
    ${icon} 0.2mi
  </div>
</div>
</div>`.trim()
    );

    return new mapboxgl.Marker(el)
      .setLngLat(geohash.decode(hash))
      .addTo(this.map)
      .setPopup(popup);
  }
})());

export default map;
