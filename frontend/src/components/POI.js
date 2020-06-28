import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { POI_CATEGORIES } from '../config/base';

const useStyles = makeStyles(theme => ({
  container: {
    color: theme.palette.text.primary,
    padding: '5px 0',
    margin: '5px 0',
    display: 'block',
  },
  name: {},
  tagline: { fontSize: 12, paddingLeft: 20 },
}));

const Component = ({ poi }) => {
  const classes = useStyles();

  return (
    <Link
      to={`/poi/${poi.hash}`}
      className={clsx(classes.container, 'nav--poi')}
    >
      <div className={classes.name}>
        <span role="img" aria-label="incident">
          {POI_CATEGORIES[poi.category].icon}
        </span>{' '}
        Near {poi.address}
      </div>
      <div className={classes.tagline}>0.2 mi</div>
    </Link>
  );
};

export default connect(state => {
  return {};
}, mapDispatchToProps)(Component);
