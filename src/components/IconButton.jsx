/* eslint-disable react/prop-types */
import classNames from "classnames";

export function IconButton({ active = false, disabled = false, icon, onClick }) {
  const className = classNames('icon-button', {
    'active': active,
    'disabled': disabled,
  });
  return (
    <span className={className} onClick={onClick}>
      {icon}
    </span>
  );
}
