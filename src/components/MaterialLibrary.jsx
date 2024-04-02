import { Checkbox } from "antd";
import { materials } from '../../mock/materials';
import { useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { EditorContext } from '../context';
import { TOOL } from "../constants";
import { EVENT } from '../event';

/* eslint-disable react/prop-types */
export function MaterialLibrary({ showMask, onShowMaskChange }) {
  return (
    <div className="material">
      <Checkbox
        style={{margin: 16}}
        checked={showMask}
        onChange={onShowMaskChange}
      >
        进入隔离模式
      </Checkbox>
      <FloorMaterial />
    </div>
  );
}

function FloorMaterial() {
  const editor = useContext(EditorContext);

  const [material, setMaterial] = useState(null);

  useEffect(() => {
    if (!editor) return;

    const handleToolChange = ({ tool }) => {
      if (tool !== TOOL.floor) {
        setMaterial(null);
      }
    };

    editor.on(EVENT.toolChange, handleToolChange);

    return () => {
      editor.off(EVENT.toolChange, handleToolChange);
    };
  }, [editor]);

  const handleClickFoor = (material) => {
    setMaterial(material);
    editor.stopTool();
    editor.invokeTool(TOOL.floor, { material });
  };

  const floors = [materials.floor, materials.floor2];

  return (
    <div>
      <div>地板</div>
      <div className="floor-list">
        {floors.map((item) => (
          <img
            key={item.code}
            src={item.url}
            className={classNames("floor", {
              'active': material?.code === item.code,
            })}
            onClick={() => handleClickFoor(item)}
          />
        ))}
      </div>
    </div>
  );
}
