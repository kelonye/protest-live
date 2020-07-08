import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { makeStyles } from '@material-ui/core/styles';
import {
  IconButton,
  Tooltip,
  AppBar,
  Typography,
  Toolbar,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import UserIcon from '@material-ui/icons/AccountCircle';
import { HEADER_HEIGHT } from 'config';
import sl from 'utils/sl';

const useStyles = makeStyles(theme => ({
  container: {
    height: HEADER_HEIGHT,
    '& .MuiToolbar-regular': {
      minHeight: HEADER_HEIGHT,
    },
  },
}));

function Component({ deactivateWallet, accountId, setIsAddingPOI }) {
  const classes = useStyles();

  return (
    <AppBar position="fixed" color="inherit" className={classes.container}>
      <Toolbar color="inherit">
        <Typography
          variant="h6"
          className={'flex flex--grow'}
          style={{ marginLeft: 20 }}
        >
          Protest Live
        </Typography>

        {!accountId ? null : (
          <Tooltip title="User">
            <IconButton
              onClick={() => {
                sl('warning', 'Disconnect account?', 'Warning', () => {
                  deactivateWallet();
                });
              }}
            >
              <div className={'flex flex--column flex--grow flex--align-end'}>
                <UserIcon />
                <div style={{ fontSize: 10 }}>{accountId}</div>
              </div>
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Add Place">
          <IconButton onClick={() => setIsAddingPOI(true)}>
            <div className={'flex flex--column flex--grow'}>
              <AddIcon className={classes.icon} />
              <div style={{ fontSize: 10 }}>Add</div>
            </div>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

const mapStateToProps = state => {
  const {
    wallet: { accountId },
  } = state;
  return {
    accountId,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
