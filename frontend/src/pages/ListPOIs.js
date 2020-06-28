import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { makeStyles } from '@material-ui/core/styles';
import Loader from 'components/Loader';
import { listPOIsSelector } from 'selectors/map';
// import { Link } from 'react-router-dom';
import POI from 'components/POI';
import { POI_CATEGORIES } from 'config';

const useStyles = makeStyles(theme => ({}));

const Component = ({ activeCategory, isLoading, pois, match }) => {
  const classes = useStyles();
  const { label, headingLabel, tagLine } = POI_CATEGORIES[activeCategory];

  return (
    <div className={classes.container}>
      <div className="drawer__title flex flex--column flex--justify-center">
        <div>{label || headingLabel}</div>
        <div style={{ fontSize: 10 }}>{tagLine}</div>
      </div>
      <div className="drawer__content">
        {isLoading ? (
          <Loader />
        ) : !pois.length ? (
          <div className="flex flex--column flex--align-center">
            No places found.
          </div>
        ) : (
          <div>
            {pois.map(poi => (
              <div key={poi.hash}>
                <POI poi={poi} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default connect(state => {
  const {
    map: {
      activeView: { category: activeCategory, isLoading },
    },
  } = state;
  return {
    pois: listPOIsSelector(state),
    isLoading,
    activeCategory,
  };
}, mapDispatchToProps)(Component);
