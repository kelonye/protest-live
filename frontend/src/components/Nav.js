import React from 'react';
import { connect } from 'react-redux';
import * as mapDispatchToProps from 'actions';
import { withRouter } from 'react-router-dom';
import clsx from 'clsx';
import { POI_CATEGORIES as TABS } from 'config';

const Component = ({ activeCategory, updateData, navigate }) => (
  <div className="nav flex flex-grow">
    {TABS.map(({ label, icon }, i) => (
      <div
        onClick={() => {
          updateData({ activeView: { category: i } });
          navigate('/');
        }}
        className={clsx(
          'flex flex--column flex--grow flex--justify-center flex--align-center',
          { active: activeCategory === i }
        )}
        key={label}
      >
        <div style={{ fontSize: 17 }}>{icon}</div>
        <div>{label}</div>
      </div>
    ))}
  </div>
);

export default withRouter(
  connect(({ map: { activeView: { category: activeCategory } } }) => {
    return {
      activeCategory,
    };
  }, mapDispatchToProps)(Component)
);
