import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { TextField, Select, MenuItem, Button } from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import sl from 'utils/sl';
import map from 'map';
import { POI_CATEGORIES } from 'config';
import { mapbox as xhrMapbox } from 'utils/xhr';
import Loader from 'components/Loader';

const useStyles = makeStyles(theme => ({
  row: {
    marginBottom: 20,
  },
  rowHeading: {
    marginBottom: 10,
    // color: theme.palette.action.active,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12, // '1rem',
    fontWeight: 400,
    lineHeight: 1,
  },
  button: {
    width: 100,
  },
  addButton: {
    marginRight: 5,
  },
}));

const Component = ({
  lat,
  lng,
  createPOI,
  goHome,
  accountId,
  activateWallet,
  navigate,
  updateData,
  isAdding,
  match,
}) => {
  const classes = useStyles();
  const [address, setAddress] = React.useState('');
  const [category, setCategory] = React.useState(0);

  const onMount = async () => {
    map.showPOIBeingAdded([lng, lat]);

    console.log('looking up address %s, %s', lng, lat);
    const {
      features: [feature],
    } = await xhrMapbox(
      'get',
      `/geocoding/v5/mapbox.places/${[lng, lat].join(',')}.json`,
      { types: 'address,region,country' }
    );

    if (feature) {
      setAddress(feature.text);
    }
  };

  React.useEffect(() => {
    onMount();
    return map.removePOIBeingAdded.bind(map); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lng, lat]);

  async function onFormSubmit(e) {
    e.preventDefault();

    const info = {
      lng: parseFloat(lng),
      lat: parseFloat(lat),
      address,
      category,
    };
    ['description'].forEach(field => (info[field] = e.target[field].value));

    await createPOI(info);
    sl('success', 'Place was added!', 'Success', () => {
      updateData({ category: info.category });
      navigate('/');
    });
  }

  return (
    <form type="action" onSubmit={onFormSubmit}>
      <h4 className="drawer__title">Add Place</h4>
      <div className="drawer__content flex flex--column">
        {!accountId ? (
          <div className={'flex flex--column flex--align-center'}>
            <div style={{ marginBottom: 20 }}>
              Connect your Near account to get started...
            </div>
            <Button
              variant="contained"
              className={classes.button}
              onClick={activateWallet}
              type="button"
            >
              CONNECT
            </Button>
          </div>
        ) : isAdding ? (
          <Loader />
        ) : (
          <div>
            <div className={classes.row}>
              <TextField
                id="address"
                label="Address"
                type="text"
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder={'Please specify physical address of the place.'}
                value={address}
                onChange={e => setAddress(e.target.value)}
                fullWidth
                required
              />
            </div>
            <div className={classes.row}>
              <div style={{ fontSize: 10 }}>
                Longitude: {lng}
                <br />
                Latitude: {lat}
              </div>
            </div>
            <div className={classes.row}>
              <div className={classes.rowHeading}>Category *</div>
              <Select
                value={category}
                onChange={event => setCategory(event.target.value)}
                fullWidth
              >
                {POI_CATEGORIES.map((c, i) => (
                  <MenuItem key={i} value={i}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div className={classes.row}>
              <TextField
                id="description"
                label="Description"
                type="text"
                InputLabelProps={{
                  shrink: true,
                }}
                multiline
                rows="4"
                placeholder="Write a good description of the place here."
                defaultValue={''}
                fullWidth
              />
            </div>
            <div className={classes.row}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className={clsx(classes.button, classes.addButton)}
              >
                Add
              </Button>
              <Button
                variant="contained"
                className={classes.button}
                onClick={() => {
                  goHome();
                }}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default connect(
  (
    {
      wallet: { accountId, balance },
      map: {
        addPOI: { isSyncing: isAdding },
      },
    },
    {
      match: {
        params: { lat, lng },
      },
    }
  ) => {
    return { lat, lng, accountId, isAdding };
  },
  mapDispatchToProps
)(Component);
