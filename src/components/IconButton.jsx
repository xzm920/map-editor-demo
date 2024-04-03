/* eslint-disable react/prop-types */
import classNames from "classnames";
import { Icon } from "./Icon";
import { Tooltip } from "antd";

export function IconButton({ active = false, disabled = false, name, tooltip, onClick }) {
  const className = classNames('icon-button', {
    'active': active,
    'disabled': disabled,
  });
  return (
    <Tooltip title={tooltip}>
      <span className={className} onClick={onClick}>
        <Icon name={name} />
      </span>
    </Tooltip>
  );
}
