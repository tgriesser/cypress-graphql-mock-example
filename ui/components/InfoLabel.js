import React from 'react';

export default function InfoLabel({ label, value }) {
  return (
    <span className="label label-info">{label}: {value}</span>
  );
}

InfoLabel.propTypes = {
  label: React.PropTypes.string,
  value: React.PropTypes.number,
};
