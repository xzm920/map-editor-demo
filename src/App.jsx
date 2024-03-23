/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Checkbox, ColorPicker, ConfigProvider, InputNumber, Slider } from "antd";
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, BoldOutlined, ExpandOutlined, ItalicOutlined, MinusOutlined, PlusOutlined, RedoOutlined, UnderlineOutlined, UndoOutlined } from '@ant-design/icons';
import { throttle } from "lodash";
import { MapEditor } from "./mapEditor";
import { materials } from "../mock/materials";
import { resources } from '../mock/resources';
import { MAP_ITEM_TYPE, TEXT_ALIGN, TILE_SIZE } from "./constants";
import { createBackgroundImageFromResource, createMapItemFromMaterial, createText } from "./model/create";

function App() {
  const canvasWrapper = useRef();
  const editorRef = useRef();
  const [zoom, setZoom] = useState(1);
  const [showMask, setShowMask] = useState(false);
  const [showEffect, setShowEffect] = useState(false);
  const [alignTile, setAlignTile] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selected, setSelected] = useState(null);
  const mapItemRef = useRef(null);

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
      // sticker.rotate(30, sticker.left, sticker.top);
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
      setAlignTile(mapEditor.alignTile);
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

    const handleToggleAlignTile = () => {
      setAlignTile(mapEditor.alignTile);
    };
    mapEditor.on('toggleAlignTile', handleToggleAlignTile);

    const handleToggleEffect = () => {
      setShowEffect(mapEditor.showEffect);
    };
    mapEditor.on('toggleEffect', handleToggleEffect);

    const handleHistory = () => {
      setCanUndo(mapEditor.canUndo);
      setCanRedo(mapEditor.canRedo);
    };
    mapEditor.on('history', handleHistory);

    const handleSelected = ({ mapItem }) => {
      setSelected({ ...mapItem });
      mapItemRef.current = mapItem;
    };
    mapEditor.on('selected', handleSelected);

    const handleUnselected = () => {
      setSelected(null);
      mapItemRef.current = null;
    };
    mapEditor.on('unselected', handleUnselected);

    const handleUpdate = ({ item }) => {
      if (item === mapItemRef.current) {
        setSelected({ ...item });
      }
    };
    mapEditor.on('update', handleUpdate);
    const handleToggleMaskPlayer = ({ mapItem }) => {
      setSelected({ ...mapItem });
    };
    mapEditor.on('toggleMaskPlayer', handleToggleMaskPlayer);

    const handleResize = throttle(() => {
      const { clientWidth, clientHeight } = canvasWrapper.current;
      mapEditor.view.setCanvasSize(clientWidth, clientHeight);
    }, 300, { trailing: true });
    window.addEventListener('resize', handleResize);

    return () => {
      mapEditor.off('zoom', handleZoom);
      mapEditor.off('toggleMask', handleToggleMask);
      mapEditor.off('toggleAlignTile', handleAlignTileChange);
      mapEditor.off('toggleEffect', handleToggleEffect);
      mapEditor.off('history', handleHistory);
      mapEditor.off('selected', handleSelected);
      mapEditor.off('unselected', handleUnselected);
      mapEditor.off('update', handleUpdate);
      mapEditor.off('toggleMaskPlayer', handleToggleMaskPlayer);
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

  const handleAlignTileChange = () => {
    editorRef.current.toggleAlignTile();
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
              alignTile={alignTile}
              onAlignTileChange={handleAlignTileChange}
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
          <div className="property">
            {selected && <PropertyPannel mapItem={selected} mapItemRef={mapItemRef} />}
          </div>
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

function ViewControl({ showEffect, showEffectDisabled, onShowEffectChange, alignTile, onAlignTileChange }) {
  return (
    <div className="view-control">
      <Checkbox checked={showEffect} disabled={showEffectDisabled} onChange={onShowEffectChange}>始终显示效果</Checkbox>
      <Checkbox checked={alignTile} onChange={onAlignTileChange}>自动对齐方格</Checkbox>
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

function PropertyPannel({ mapItem, mapItemRef }) {
  if (mapItem.type === MAP_ITEM_TYPE.image) {
    return <ImageDetail mapItem={mapItem} mapItemRef={mapItemRef} />;
  } else if (mapItem.type === MAP_ITEM_TYPE.text) {
    return <TextDetail mapItem={mapItem} mapItemRef={mapItemRef} />;
  } else {
    return <TiledDetail mapItem={mapItem} mapItemRef={mapItemRef} />
  }
}

function TiledDetail({ mapItem, mapItemRef }) {
  return (
    <div className="detail">
      <div>
        <div>{mapItem.name}</div>
        <div>
          <img className="detail-image" src={mapItem.imageURL} />
        </div>
      </div>
      <div>
        <div>基本属性</div>
        <div>
          <Checkbox
            checked={mapItem.isMaskPlayer}
            disabled={mapItem.isCollider}
            onChange={() => mapItemRef.current.toggleMaskPlayer()}
          >遮挡人物</Checkbox>
        </div>
        <div>
          <Checkbox
            checked={mapItem.isCollider}
            disabled={mapItem.isMaskPlayer}
            onChange={() => mapItemRef.current.toggleCollider()}
          >人物不可通过</Checkbox>
        </div>
      </div>
    </div>
  );
}

function ImageDetail({ mapItem, mapItemRef }) {
  return (
    <div className="detail">
      <div>
        <div>{mapItem.name}</div>
        <div>
          <img className="detail-image" src={mapItem.imageURL} />
        </div>
      </div>
      <div>
        <div>贴图效果</div>
        <div>
          {/* TODO: */}
          <Slider
            value={mapItem.opacity * 100}
            onChange={(val) => {
              mapItemRef.current.setOpacity(val / 100);
            }}
          />
        </div>
      </div>
      <div>
        <div>基本属性</div>
        <div>
          <Checkbox
            checked={mapItem.isMaskPlayer}
            onChange={() => mapItemRef.current.toggleMaskPlayer()}
          >遮挡人物</Checkbox>
        </div>
      </div>
    </div>
  );
}

function TextDetail({ mapItem, mapItemRef }) {
  console.log(mapItem.isBold)
  return (
    <div className="detail">
      <div>
        <div>文字效果</div>
        <div>
          {/* TODO: */}
          <Slider
            value={mapItem.opacity * 100}
            onChange={(val) => {
              mapItemRef.current.setOpacity(val / 100);
            }}
          />
        </div>
      </div>
      <div>
        <div>文字样式</div>
        <div>
          <ColorPicker showText value={mapItem.color} onChange={(_, val) => mapItemRef.current.setColor(val)} />
        </div>
        <div>
          <InputNumber min={9} value={mapItem.fontSize} onChange={(val) => mapItemRef.current.setFontSize(val)} />
        </div>
        <div>
          <ItalicOutlined
            className={`icon ${mapItem.isItalic ? 'active' : ''}`}
            onClick={() => mapItemRef.current.setItalic(!mapItemRef.current.isItalic) }
          />
          <BoldOutlined
            className={`icon ${mapItem.isBold ? 'active' : ''}`}
            onClick={() => mapItemRef.current.setBold(!mapItemRef.current.isBold) }
          />
          <UnderlineOutlined
            className={`icon ${mapItem.isUnderline ? 'active' : ''}`}
            onClick={() => mapItemRef.current.setUnderline(!mapItemRef.current.isUnderline) }
          />
        </div>
        <div>
          <AlignLeftOutlined
            className={`icon ${mapItem.horizontalAlign === TEXT_ALIGN.left ? 'active' : ''}`}
            onClick={() => mapItemRef.current.setTextAlign(TEXT_ALIGN.left) }
          />
          <AlignCenterOutlined
            className={`icon ${mapItem.horizontalAlign === TEXT_ALIGN.center ? 'active' : ''}`}
            onClick={() => mapItemRef.current.setTextAlign(TEXT_ALIGN.center) }
          />
          <AlignRightOutlined
            className={`icon ${mapItem.horizontalAlign === TEXT_ALIGN.right ? 'active' : ''}`}
            onClick={() => mapItemRef.current.setTextAlign(TEXT_ALIGN.right) }
          />
        </div>
        <div>
          <InputNumber value={mapItem.lineHeight} onChange={(val) => mapItemRef.current.setLineHeight(val)} />
        </div>
      </div>
      <div>
        <div>基本属性</div>
        <div>
          <Checkbox
            checked={mapItem.isMaskPlayer}
            onChange={() => mapItemRef.current.toggleMaskPlayer()}
          >遮挡人物</Checkbox>
        </div>
      </div>
    </div>
  );
}

export default App;
