/* @flow */
import React from 'react';

export type Props = {
  label?: string,
  value?: number,
};

const InfoLabel = (props: Props) => {
  const { label, value } = props;

  return (
    <span className="label label-info">
      {label}: {value}
    </span>
  );
};

export default InfoLabel;
