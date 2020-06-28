import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { HEADER_HEIGHT } from 'config';
import map from 'map';

const Component = () => {
  const mapRef = React.useRef();

  React.useEffect(() => {
    map.render(mapRef.current);
  }, [mapRef]);

  return (
    <div
      className="map"
      style={{
        top: HEADER_HEIGHT,
        left: 0,
        height: `calc(100% - ${HEADER_HEIGHT}px)`,
      }}
      ref={mapRef}
    ></div>
  );
};

export default connect(state => {
  return {};
}, mapDispatchToProps)(Component);
