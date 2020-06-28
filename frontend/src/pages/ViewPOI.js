import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Typography, Button } from '@material-ui/core';
import geohash from 'latlon-geohash';
import Loader from 'components/Loader';
import Close from 'components/NavClose';
import { POI_CATEGORIES } from 'config';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: 0,
  },
  title: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: 'bolder',
  },
  listItem: {
    padding: 0,
  },
  paper: {
    marginBottom: 10,
    padding: '10px 10px 0',
  },
  footer: {
    marginTop: 20,
  },
  footerBtn: {
    marginBottom: 15,
  },
  toggleBookmarkLoader: {
    top: 3,
    position: 'relative',
    marginLeft: 10,
  },
}));

const Component = ({
  match: {
    params: { hash },
  },
  poi,
  viewPOI,
  isLoading,
}) => {
  const classes = useStyles();
  const { address, description, category } = poi || {};
  const { lon, lat } = geohash.decode(hash);

  React.useEffect(
    () => {
      viewPOI({ hash, lng: lon, lat });
    },
    [hash] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const info = [
    !address ? null : ['Address', address],
    !category ? null : ['Category', POI_CATEGORIES[category].label],
    !hash
      ? null
      : [
          'Location',
          <div>
            Longitude: {lon}
            <br />
            Latitude: {lat}
          </div>,
        ],
    !description ? null : ['Description', description],
  ].filter(x => !!x);

  return (
    <div>
      <Close goBack={'/'} />
      <h4 className="drawer__title drawer__title--padded">View Place</h4>
      <div className="drawer__content">
        {isLoading ? (
          <Loader />
        ) : (
          <React.Fragment>
            {info.map(([k, v]) => (
              <div key={k} elevation={0} className={classes.paper}>
                <Typography variant="h6" className={classes.title}>
                  {k}
                </Typography>

                <div>{v}</div>
              </div>
            ))}

            <div className={clsx('flex', 'flex--column', classes.footer)}>
              <div className={classes.footerBtn}>
                <Button variant="contained" color="primary" fullWidth disabled>
                  Get Directions
                </Button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default connect(
  (
    {
      map: {
        pois,
        viewPOI: { isLoading },
      },
    },
    {
      match: {
        params: { hash },
      },
    }
  ) => {
    const poi = pois[hash];
    return {
      isLoading,
      poi,
    };
  },
  mapDispatchToProps
)(Component);
