import React from 'react';
import PropTypes from 'prop-types';

const InfoLabel = ({ label, value }) => (
  <span className="label label-info">
    {label}: {value}
  </span>
);

InfoLabel.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
};

export default InfoLabel;
