/* eslint-disable react/prop-types */
import { Checkbox } from "antd";
import { EVENT } from "../event";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../context";

export function ViewControl({ showEffectDisabled, alignTileVisible }) {
  const editor = useContext(EditorContext);

  const [showEffect, setShowEffect] = useState(false);
  const [alignTile, setAlignTile] = useState(false);

  useEffect(() => {
    if (!editor) return;

    setShowEffect(editor.showEffect);
    setAlignTile(editor.alignTile);

    const handleToggleEffect = () => {
      setShowEffect(editor.showEffect);
    };

    const handleToggleAlignTile = () => {
      setAlignTile(editor.alignTile);
    };
    
    
    editor.on(EVENT.toggleEffect, handleToggleEffect);
    editor.on(EVENT.toggleAlignTile, handleToggleAlignTile);

    return () => {
      editor.off(EVENT.toggleEffect, handleToggleEffect);
      editor.off(EVENT.toggleAlignTile, handleToggleAlignTile);
    };
  }, [editor]);


  return (
    <div className="view-control">
      <Checkbox
        checked={showEffect}
        disabled={showEffectDisabled}
        onChange={() => editor.toggleEffect()}
      >
        始终显示效果
      </Checkbox>
      {alignTileVisible && (
        <Checkbox
          checked={alignTile}
          onChange={() => editor.toggleAlignTile()}
        >
          自动对齐方格
        </Checkbox>
      )}
    </div>
  );
}
