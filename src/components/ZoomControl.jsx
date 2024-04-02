import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../context";
import { EVENT } from "../event";
import { ExpandOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";

export function ZoomControl() {
  const editor = useContext(EditorContext);

  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!editor) return;

    setZoom(editor.zoom);

    const handleZoom = (zoom) => {
      setZoom(zoom);
    };

    editor.on(EVENT.zoom, handleZoom);

    return () => {
      editor.off(EVENT.zoom, handleZoom);
    };
  }, [editor]);
  
  const canZoomIn = editor ? zoom < editor.maxZoom : false;
  const canZoomOut = editor ? zoom > editor.minZoom : false;

  const handleZoomFit = () => {
    editor.zoomToFit();
  };

  const handleZoomIn = () => {
    if (!canZoomIn) return;
    const zoom = (Math.round((editor.zoom * 10)) * 10 + 10) / 100;
    editor.zoomToCenter(zoom);
  };

  const handleZoomOut = () => {
    if (!canZoomOut) return;
    const zoom = (Math.round((editor.zoom * 10)) * 10 - 10) / 100;
    editor.zoomToCenter(zoom);
  };


  const zoomPercent = Math.round(zoom * 100) + '%';
  return (
    <div className="zoom-control">
      <ExpandOutlined
        className="icon"
        onClick={handleZoomFit}
      />
      <MinusOutlined
        className={`icon ${!canZoomOut ? 'disabled' : ''}`}
        onClick={handleZoomOut}
      />
      <div className="label">{zoomPercent}</div>
      <PlusOutlined
        className={`icon ${!canZoomIn ? 'disabled' : ''}`}
        onClick={handleZoomIn}
      />
    </div>
  );
}
