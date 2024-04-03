import { Checkbox } from "antd";
import { materials } from '../../mock/materials';
import { useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { EditorContext } from '../context';
import { TOOL, USER_LAYER } from "../constants";
import { EVENT } from '../event';

/* eslint-disable react/prop-types */
export function MaterialLibrary() {
  return (
    <div className="material-library">
      <MaterialList
        tool={TOOL.floor}
        title="地板"
        materials={[materials.floor, materials.floor2]}
      />
      <MaterialList
        tool={TOOL.wall}
        title="墙壁"
        materials={[materials.wallHead, materials.wallBody, materials.wallFoot]}
      />
      <MaterialList
        tool={TOOL.tiled}
        title="物件"
        materials={[materials.tiledObject, materials.tiledObject2]}
      />
      <MaterialList
        tool={TOOL.image}
        title="贴图"
        materials={[materials.sticker, materials.sticker2]}
      />
      <MaterialList
        tool={TOOL.tiled}
        title="效果"
        materials={[materials.spawn, materials.impassable]}
      />
    </div>
  );
}

function MaterialList({ materials, tool, title}) {
  const editor = useContext(EditorContext);

  const [material, setMaterial] = useState(null);

  useEffect(() => {
    if (!editor) return;

    const handleToolChange = ({ tool: currentTool }) => {
      if (currentTool !== tool) {
        setMaterial(null);
      }
    };

    editor.on(EVENT.toolChange, handleToolChange);

    return () => {
      editor.off(EVENT.toolChange, handleToolChange);
    };
  }, [editor, tool]);

  const handleClick = (material) => {
    setMaterial(material);
    if (material.layer === USER_LAYER.effect) {
      editor.setMask(true);
    } else {
      editor.setMask(false);
    }
    editor.invokeTool(tool, { material });
  };

  return (
    <div>
      <div>{title}</div>
      <div className="material-list">
        {materials.map((item) => (
          <img
            key={item.code}
            src={item.url}
            className={classNames("material", {
              'active': material?.code === item.code,
            })}
            onClick={() => handleClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
