import React from 'react';

const InfoLabel = ({ label, value }) => (
  <span className="label label-info">
    {label}: {value}
  </span>
);

InfoLabel.propTypes = {
  label: React.PropTypes.string,
  value: React.PropTypes.number,
};

export default InfoLabel;
