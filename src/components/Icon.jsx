/* eslint-disable react/prop-types */
export const Icon = ({ name }) => (
  <svg className="svg-icon">
    <use href={`/__spritemap#icon-${name}`} />
  </svg>
);
