import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { withRouter } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { Route, Switch } from 'react-router-dom';
import ListPOIs from 'pages/ListPOIs';
import RegisterPOI from 'pages/RegisterPOI';
import ViewPOI from 'pages/ViewPOI';

const DEFAULT_Y = 200;
const H = window.outerHeight;
const W = window.outerWidth;

function Component({ locationPathName, activeCategory, updateData }) {
  const [y, setY] = React.useState(DEFAULT_Y);

  React.useEffect(() => {
    const el = document.body.querySelector('.mapboxgl-ctrl-bottom-right');
    if (el) el.style.bottom = `${H - y - 40}px`;
  }, [y]);

  React.useEffect(() => {
    setY(DEFAULT_Y);
  }, [setY, locationPathName]);

  return (
    <Rnd
      className="drawer"
      default={{
        x: 0,
        y: DEFAULT_Y,
        width: W,
        height: H - DEFAULT_Y,
      }}
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      dragAxis={'y'}
      size={{ width: '100%', height: H - y }}
      position={{ x: 0, y }}
      onDrag={(e, { y }) => {
        setY(y);
        // setY(y < 0 ? 0 : y);
      }}
      enableUserSelectHack={false}
    >
      <Switch>
        <Route exact path={'/poi/:hash'} component={ViewPOI} />
        <Route path={'/add-poi/:lng/:lat'} component={RegisterPOI} />
        <Route path={'/'} component={ListPOIs} />
      </Switch>
    </Rnd>
  );
}

export default withRouter(
  connect(
    (
      {
        map: {
          activeView: { category: activeCategory },
        },
      },
      { match }
    ) => {
      return {
        locationPathName: window.location.pathname,
        activeCategory,
      };
    },
    mapDispatchToProps
  )(Component)
);
