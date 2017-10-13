/* @flow */
import React from 'react';

export type Props = {
  label?: string,
  value?: number,
};

const InfoLabel = ({ label, value }: Props) => (
  <span className="label label-info">
    {label}: {value}
  </span>
);

export default InfoLabel;
