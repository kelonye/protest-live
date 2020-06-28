import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { Snackbar, Button } from '@material-ui/core';

function Component({ isAdding, setIsAddingPOI }) {
  function getIsOpen() {
    return isAdding;
  }

  function getContent() {
    let message, action;
    if (isAdding) {
      message = 'Click on map to add the new place...';
      action = (
        <React.Fragment>
          <Button color="primary" size="small" onClick={e => handleClose(e)}>
            CANCEL
          </Button>
        </React.Fragment>
      );
    }
    return { message, action };
  }

  function handleClose(e, reason) {
    if (reason !== 'clickaway') {
      if (isAdding) {
        setIsAddingPOI(false);
      }
    }
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={getIsOpen()}
      onClose={handleClose}
      {...getContent()}
    />
  );
}

export default connect(({ map: { addPOI: { isAdding } } }) => {
  return {
    isAdding,
  };
}, mapDispatchToProps)(Component);
