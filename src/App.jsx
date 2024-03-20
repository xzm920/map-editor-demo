/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Checkbox, ConfigProvider } from "antd";
import { ExpandOutlined, MinusOutlined, PlusOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { throttle } from "lodash";
import { MapEditor } from "./mapEditor";
import { materials } from "../mock/materials";
import { resources } from '../mock/resources';
import { TILE_SIZE } from "./constants";
import { createBackgroundImageFromResource, createMapItemFromMaterial, createText } from "./model/create";

function App() {
  const canvasWrapper = useRef();
  const editorRef = useRef();
  const [zoom, setZoom] = useState(1);
  const [showMask, setShowMask] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const canZoomIn = editorRef.current ? zoom < editorRef.current.maxZoom : false;
  const canZoomOut = editorRef.current ? zoom > editorRef.current.minZoom : false;

  useEffect(() => {
    const { clientWidth, clientHeight } = canvasWrapper.current;

    const size = 20;
    const mapEditor = new MapEditor({
      elem: 'canvas',
      width: size,
      height: size,
      canvasWidth: clientWidth,
      canvasHeight: clientHeight,
    });
    editorRef.current = mapEditor;

    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const floor = createMapItemFromMaterial(materials.floor, j * TILE_SIZE, i * TILE_SIZE);
          mapEditor.model.add(floor);
        }
      }
      const wallHead = createMapItemFromMaterial(materials.wallHead, 2 * TILE_SIZE, 2 * TILE_SIZE);
      mapEditor.model.add(wallHead);
      const wallBody = createMapItemFromMaterial(materials.wallBody, 2 * TILE_SIZE, 3 * TILE_SIZE);
      mapEditor.model.add(wallBody);
      const wallFoot = createMapItemFromMaterial(materials.wallFoot, 2 * TILE_SIZE, 4 * TILE_SIZE);
      mapEditor.model.add(wallFoot);
      const tiled1 = createMapItemFromMaterial(materials.tiledObject, 1 * TILE_SIZE, 1 * TILE_SIZE);
      tiled1.toggleCollider();
      mapEditor.model.add(tiled1);
      const tiled2 = createMapItemFromMaterial(materials.tiledObject, 2 * TILE_SIZE, 1 * TILE_SIZE);
      mapEditor.model.add(tiled2);
      const tiled3 = createMapItemFromMaterial(materials.tiledObject2, 2 * TILE_SIZE, 1 * TILE_SIZE);
      mapEditor.model.add(tiled3);
      const tiled4 = createMapItemFromMaterial(materials.tiledObject2, 3 * TILE_SIZE, 2 * TILE_SIZE);
      mapEditor.model.add(tiled4);
      const sticker = createMapItemFromMaterial(materials.sticker, 4 * TILE_SIZE, 2 * TILE_SIZE);
      sticker.rotate(30, sticker.left, sticker.top);
      mapEditor.model.add(sticker);
      const spawn = createMapItemFromMaterial(materials.spawn, 2 * TILE_SIZE, 2 * TILE_SIZE);
      mapEditor.model.add(spawn);
      const impassable1 = createMapItemFromMaterial(materials.impassable, 4 * TILE_SIZE, 3 * TILE_SIZE);
      mapEditor.model.add(impassable1);
      const text1 = createText('Hello!', 500, 64);
      mapEditor.model.add(text1);
      const backgroundImage = createBackgroundImageFromResource(resources.backgroundImage, 0, 0);
      backgroundImage.scale(0, 0, 960, 640);
      mapEditor.model.add(backgroundImage);

      mapEditor.zoomToFit();
      setZoom(mapEditor.zoom);
      setShowMask(mapEditor.showMask);
      setShowEffect(mapEditor.showEffect);
      setCanUndo(mapEditor.canUndo);
      setCanRedo(mapEditor.canRedo);
    });
    // debug
    window.mapEditor = mapEditor;

    const handleZoom = (zoom) => {
      setZoom(zoom);
    };
    mapEditor.on('zoom', handleZoom);

    const handleToggleMask = () => {
      setShowMask(mapEditor.showMask);
    };
    mapEditor.on('toggleMask', handleToggleMask);

    const handleToggleEffect = () => {
      setShowEffect(mapEditor.showEffect);
    };
    mapEditor.on('toggleEffect', handleToggleEffect);

    const handleHistory = () => {
      setCanUndo(mapEditor.canUndo);
      setCanRedo(mapEditor.canRedo);
    };
    mapEditor.on('history', handleHistory);

    const handleResize = throttle(() => {
      const { clientWidth, clientHeight } = canvasWrapper.current;
      mapEditor.view.setCanvasSize(clientWidth, clientHeight);
    }, 300, { trailing: true });
    window.addEventListener('resize', handleResize);

    return () => {
      mapEditor.off('zoom', handleZoom);
      mapEditor.off('toggleMask', handleToggleMask);
      mapEditor.off('toggleEffect', handleToggleEffect);
      mapEditor.off('history', handleHistory);
      window.removeEventListener('resize', handleResize);
      mapEditor.dispose();
    };
  }, []);

  const handleZoomFit = () => {
    const mapEditor = editorRef.current;
    mapEditor.zoomToFit();
  };

  const handleZoomIn = () => {
    if (!canZoomIn) return;
    const mapEditor = editorRef.current;
    const zoom = (Math.round((mapEditor.view.zoom * 10)) * 10 + 10) / 100;
    mapEditor.zoomToCenter(zoom);
  };

  const handleZoomOut = () => {
    if (!canZoomOut) return;
    const mapEditor = editorRef.current;
    const zoom = (Math.round((mapEditor.view.zoom * 10)) * 10 - 10) / 100;
    mapEditor.zoomToCenter(zoom);
  };

  const handleShowMaskChange = () => {
    const mapEditor = editorRef.current;
    mapEditor.toggleMask();
  };

  const handleShowEffectChange = () => {
    const mapEditor = editorRef.current;
    mapEditor.toggleEffect();
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const mapEditor = editorRef.current;
    mapEditor.undo();
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const mapEditor = editorRef.current;
    mapEditor.redo();
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#8f7ef4'
        }
      }}
    >
      <div className="app">
        <div className="head">
          <UndoControl
            undoDisabled={!canUndo}
            redoDisabled={!canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>
        <div className="body">
          <div className="material">
            <Checkbox style={{margin: 16}} checked={showMask} onChange={handleShowMaskChange}>进入隔离模式</Checkbox>
          </div>
          <div className="canvas-wrapper" ref={canvasWrapper}>
            <canvas id="canvas"></canvas>
            <ViewControl
              showEffect={showEffect}
              showEffectDisabled={showMask}
              onShowEffectChange={handleShowEffectChange}
            />
            <ZoomControl
              zoom={zoom}
              zoomInDisabled={!canZoomIn}
              zoomOutDisabled={!canZoomOut}
              onZoomFit={handleZoomFit}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
          </div>
          <div className="property">属性面板</div>
        </div>
      </div>
    </ConfigProvider>
  );
}

function ZoomControl({ zoom, onZoomFit, onZoomIn, onZoomOut, zoomInDisabled, zoomOutDisabled }) {
  const zoomPercent = Math.round(zoom * 100) + '%';
  return (
    <div className="zoom-control">
      <ExpandOutlined className="icon" onClick={onZoomFit} />
      <MinusOutlined className={`icon ${zoomOutDisabled ? 'disabled' : ''}`} onClick={onZoomOut} />
      <div className="label">{zoomPercent}</div>
      <PlusOutlined className={`icon ${zoomInDisabled ? 'disabled' : ''}`} onClick={onZoomIn} />
    </div>
  );
}

function ViewControl({ showEffect, showEffectDisabled, onShowEffectChange }) {
  return (
    <div className="view-control">
      <Checkbox checked={showEffect} disabled={showEffectDisabled} onChange={onShowEffectChange}>始终显示效果</Checkbox>
    </div>
  );
}

function UndoControl({ undoDisabled, redoDisabled, onUndo, onRedo }) {
  return (
    <div className="undo-control">
      <UndoOutlined className={`icon ${undoDisabled ? 'disabled' : ''}`} onClick={onUndo} />
      <RedoOutlined className={`icon ${redoDisabled ? 'disabled' : ''}`} onClick={onRedo} />
    </div>
  );
}

export default App;
