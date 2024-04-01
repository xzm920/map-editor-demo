/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Checkbox, ColorPicker, ConfigProvider, InputNumber, Slider } from "antd";
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, BoldOutlined, ExpandOutlined, ItalicOutlined, MinusOutlined, PlusOutlined, UnderlineOutlined } from '@ant-design/icons';
import { throttle } from "lodash";
import { MapEditor } from "./mapEditor";
import { materials } from "../mock/materials";
import { resources } from '../mock/resources';
import { DEFAULT_LINE_HEIGHT, MAP_ITEM_TYPE, TEXT_ALIGN, TILE_SIZE, TOOL } from "./constants";
import { createBackgroundImageFromResource, createMapItemFromMaterial, createText } from "./model/create";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { EVENT } from "./event";

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
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [tool, setTool] = useState(null);

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
      mapEditor.startBatch();
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const floor = createMapItemFromMaterial(materials.floor, j * TILE_SIZE, i * TILE_SIZE);
          mapEditor.add(floor);
        }
      }
      const wallHead = createMapItemFromMaterial(materials.wallHead, 2 * TILE_SIZE, 2 * TILE_SIZE);
      mapEditor.add(wallHead);
      const wallBody = createMapItemFromMaterial(materials.wallBody, 2 * TILE_SIZE, 3 * TILE_SIZE);
      mapEditor.add(wallBody);
      const wallFoot = createMapItemFromMaterial(materials.wallFoot, 2 * TILE_SIZE, 4 * TILE_SIZE);
      mapEditor.add(wallFoot);
      const tiled1 = createMapItemFromMaterial(materials.tiledObject, 1 * TILE_SIZE, 1 * TILE_SIZE);
      tiled1.toggleCollider();
      mapEditor.add(tiled1);
      const tiled2 = createMapItemFromMaterial(materials.tiledObject, 2 * TILE_SIZE, 1 * TILE_SIZE);
      mapEditor.add(tiled2);
      const tiled3 = createMapItemFromMaterial(materials.tiledObject2, 2 * TILE_SIZE, 1 * TILE_SIZE);
      mapEditor.add(tiled3);
      const tiled4 = createMapItemFromMaterial(materials.tiledObject2, 3 * TILE_SIZE, 2 * TILE_SIZE);
      mapEditor.add(tiled4);
      const sticker1 = createMapItemFromMaterial(materials.sticker, 4 * TILE_SIZE, 6 * TILE_SIZE);
      mapEditor.add(sticker1);
      const sticker2 = createMapItemFromMaterial(materials.sticker, 4 * TILE_SIZE, 2 * TILE_SIZE);
      sticker2.rotate(30, sticker2.left, sticker2.top);
      mapEditor.add(sticker2);
      window.sticker1 = sticker1;
      window.sticker2 = sticker2;
      const spawn = createMapItemFromMaterial(materials.spawn, 2 * TILE_SIZE, 2 * TILE_SIZE);
      mapEditor.add(spawn);
      const impassable1 = createMapItemFromMaterial(materials.impassable, 4 * TILE_SIZE, 3 * TILE_SIZE);
      mapEditor.add(impassable1);
      const text1 = createText('Hello!', 500, 764, 100, 48);
      mapEditor.add(text1);
      const backgroundImage = createBackgroundImageFromResource(resources.backgroundImage, 0, 0);
      backgroundImage.scale(0, 0, 960, 640);
      mapEditor.add(backgroundImage);
      mapEditor.stopBatch();

      mapEditor.zoomToFit();
      setZoom(mapEditor.zoom);
      setShowMask(mapEditor.showMask);
      setShowEffect(mapEditor.showEffect);
      setAlignTile(mapEditor.alignTile);
      setCanUndo(mapEditor.canUndo());
      setCanRedo(mapEditor.canRedo());
      setTool(mapEditor.currentTool);
    });
    // debug
    window.mapEditor = mapEditor;

    const handleZoom = (zoom) => {
      setZoom(zoom);
    };
    mapEditor.on(EVENT.zoom, handleZoom);

    const handleToggleMask = () => {
      setShowMask(mapEditor.showMask);
    };
    mapEditor.on(EVENT.toggleMask, handleToggleMask);

    const handleToggleAlignTile = () => {
      setAlignTile(mapEditor.alignTile);
    };
    mapEditor.on(EVENT.toggleAlignTile, handleToggleAlignTile);

    const handleToggleEffect = () => {
      setShowEffect(mapEditor.showEffect);
    };
    mapEditor.on(EVENT.toggleEffect, handleToggleEffect);

    const handleHistory = () => {
      setCanUndo(mapEditor.canUndo());
      setCanRedo(mapEditor.canRedo());
    };
    mapEditor.on(EVENT.history, handleHistory);

    const handleSelectionChange = ({ items }) => {
      if (items.length === 1) {
        setSelected({ ...items[0] });
        mapItemRef.current = items[0];
      } else {
        setSelected(null);
        mapItemRef.current = null;
      }
    };
    mapEditor.on(EVENT.selectionChange, handleSelectionChange);

    const handleUpdate = ({ item }) => {
      if (item === mapItemRef.current) {
        setSelected({ ...item });
      }
    };
    mapEditor.on(EVENT.update, handleUpdate);

    const handleToggleMaskPlayer = ({ mapItem }) => {
      setSelected({ ...mapItem });
    };
    mapEditor.on(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);

    const handleContextMenu = ({ position }) => {
      setShowContextMenu(true);
      setContextMenuPosition(position);
    };
    mapEditor.on(EVENT.contextMenu, handleContextMenu);

    const handleToolChange = ({ tool }) => {
      setTool(tool);
    };
    mapEditor.on(EVENT.toolChange, handleToolChange);

    const handleResize = throttle(() => {
      const { clientWidth, clientHeight } = canvasWrapper.current;
      mapEditor.setCanvasSize(clientWidth, clientHeight);
    }, 300, { trailing: true });
    window.addEventListener('resize', handleResize);

    return () => {
      mapEditor.off(EVENT.zoom, handleZoom);
      mapEditor.off(EVENT.toggleMask, handleToggleMask);
      mapEditor.off(EVENT.toggleAlignTile, handleAlignTileChange);
      mapEditor.off(EVENT.toggleEffect, handleToggleEffect);
      mapEditor.off(EVENT.history, handleHistory);
      mapEditor.off(EVENT.selectionChange, handleSelectionChange);
      mapEditor.off(EVENT.update, handleUpdate);
      mapEditor.off(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);
      mapEditor.off(EVENT.contextMenu, handleContextMenu);
      mapEditor.off(EVENT.toolChange, handleToolChange);
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
    const zoom = (Math.round((mapEditor.zoom * 10)) * 10 + 10) / 100;
    mapEditor.zoomToCenter(zoom);
  };

  const handleZoomOut = () => {
    if (!canZoomOut) return;
    const mapEditor = editorRef.current;
    const zoom = (Math.round((mapEditor.zoom * 10)) * 10 - 10) / 100;
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

  const invokeTool = (tool) => {
    editorRef.current.invokeTool(tool);
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
          <div className="head-left">
            <IconButton
              icon={<Icon name="undo" />}
              disabled={!canUndo}
              onClick={handleUndo}
            />
            <IconButton
              icon={<Icon name="redo" />}
              disabled={!canRedo}
              onClick={handleRedo}
            />
            <IconButton
              icon={<Icon name={TOOL.select} />}
              active={tool === TOOL.select}
              onClick={() => invokeTool(TOOL.select)}
            />
            <IconButton
              icon={<Icon name={TOOL.hand} />}
              active={tool === TOOL.hand}
              onClick={() => invokeTool(TOOL.hand)}
            />
            <IconButton
              icon={<Icon name={TOOL.erase} />}
              active={tool === TOOL.erase}
              onClick={() => invokeTool(TOOL.erase)}
            />
            <IconButton
              icon={<Icon name={TOOL.text} />}
              active={tool === TOOL.text}
              onClick={() => invokeTool(TOOL.text)}
            />
          </div>
          <div>地图编辑器 Demo</div>
          <div>
            <GithubButton />
          </div>
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
              alignTileVisible={tool === TOOL.select}
            />
            <ZoomControl
              zoom={zoom}
              zoomInDisabled={!canZoomIn}
              zoomOutDisabled={!canZoomOut}
              onZoomFit={handleZoomFit}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
            <ContextMenu
              showContextMenu={showContextMenu}
              setShowContextMenu={setShowContextMenu}
              contextMenuPosition={contextMenuPosition}
              mapItemRef={mapItemRef}
              editorRef={editorRef}
            />
          </div>
          <div className="property">
            {selected && <PropertyPannel mapItem={selected} mapItemRef={mapItemRef} editorRef={editorRef} />}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

function GithubButton() {
  return (
    <a href="https://github.com/xzm920/map-editor-demo" target="_blank" style={{marginRight:4}}>
      <svg height="32" viewBox="0 0 16 16" version="1.1" width="32">
        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
      </svg>
    </a>
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

function ViewControl({ showEffect, showEffectDisabled, onShowEffectChange, alignTile, onAlignTileChange, alignTileVisible }) {
  return (
    <div className="view-control">
      <Checkbox checked={showEffect} disabled={showEffectDisabled} onChange={onShowEffectChange}>始终显示效果</Checkbox>
      {alignTileVisible && <Checkbox checked={alignTile} onChange={onAlignTileChange}>自动对齐方格</Checkbox>}
    </div>
  );
}

function PropertyPannel({ mapItem, mapItemRef, editorRef }) {
  if (mapItem.type === MAP_ITEM_TYPE.image) {
    return <ImageDetail mapItem={mapItem} mapItemRef={mapItemRef} editorRef={editorRef} />;
  } else if (mapItem.type === MAP_ITEM_TYPE.text) {
    return <TextDetail mapItem={mapItem} mapItemRef={mapItemRef} editorRef={editorRef} />;
  } else if (mapItem.type === MAP_ITEM_TYPE.tiledObject) {
    return <TiledDetail mapItem={mapItem} mapItemRef={mapItemRef} editorRef={editorRef} />
  } else {
    return <BaseDetail mapItem={mapItem} />
  }
}

function BaseDetail({ mapItem }) {
  return (
    <div className="detail">
      <div>
        <div>{mapItem.name}</div>
        <div>
          <img className="detail-image" src={mapItem.imageURL} />
        </div>
      </div>
    </div>
  );
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

function ImageDetail({ mapItem, mapItemRef, editorRef }) {
  const [opacity, setOpacity] = useState(mapItem.opacity * 100);

  useEffect(() => {
    setOpacity(mapItem.opacity * 100);
  }, [mapItem.opacity]);

  const handleOpacityChange = (val) => {
    setOpacity(val);
    editorRef.current.setViewByItem(mapItemRef.current, { opacity: val / 100 });
  };

  const handleChangeComplete = (val) => {
    mapItemRef.current.setOpacity(val / 100);
  };

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
          <Slider
            value={opacity}
            onChange={handleOpacityChange}
            onChangeComplete={handleChangeComplete}
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

function TextDetail({ mapItem, mapItemRef, editorRef }) {
  const fontSizeRef = useRef();
  const lineHeightRef = useRef();
  const [opacity, setOpacity] = useState(mapItem.opacity * 100);
  const [color, setColor] = useState(mapItem.color);
  const [fontSize, setFontSize] = useState(mapItem.fontSize);
  const [lineHeight, setLineHeight] = useState(mapItem.lineHeight);

  useEffect(() => {
    setOpacity(mapItem.opacity * 100);
  }, [mapItem.opacity]);

  useEffect(() => {
    setColor(mapItem.color);
  }, [mapItem.color]);

  useEffect(() => {
    setFontSize(mapItem.fontSize);
  }, [mapItem.fontSize]);
  

  useEffect(() => {
    setLineHeight(mapItem.lineHeight);
  }, [mapItem.lineHeight]);

  const handleOpacityChange = (val) => {
    setOpacity(val);
    editorRef.current.setViewByItem(mapItemRef.current, { opacity: val / 100 });
  };

  const handleOpacityComplete = (val) => {
    mapItemRef.current.setOpacity(val / 100);
  };

  return (
    <div className="detail">
      <div>
        <div>文字效果</div>
        <div>
          <Slider
            value={opacity}
            onChange={handleOpacityChange}
            onChangeComplete={handleOpacityComplete}
          />
        </div>
      </div>
      <div>
        <div>文字样式</div>
        <div>
          <ColorPicker
            disabledAlpha
            value={color}
            onChange={(_, hex) => {
              setColor(hex);
              editorRef.current.setViewByItem(mapItemRef.current, { color: hex });
            }}
            onChangeComplete={(color) => mapItemRef.current.setColor(color.toHexString()) }
          />
        </div>
        <div>
          <InputNumber
            ref={fontSizeRef}
            value={fontSize}
            min={10}
            max={64}
            onChange={(val) => {
              setFontSize(val);
              if (val >= 10 && val <= 64) {
                editorRef.current.setViewByItem(mapItemRef.current, { fontSize: val });
              }
            }}
            onBlur={() => {
              if (fontSize === null || fontSize < 10 || fontSize > 64) {
                setFontSize(mapItem.fontSize);
              } else {
                mapItemRef.current.setFontSize(fontSize);
              }
            }}
            onPressEnter={() => fontSizeRef.current.blur() }
          />
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
          <InputNumber
            ref={lineHeightRef}
            value={lineHeight}
            min={0}
            placeholder={lineHeight === null ? (DEFAULT_LINE_HEIGHT * fontSize).toFixed(2) : ''}
            onChange={(val) => {
              setLineHeight(val);
              if (val >= 10 && val <= 64) {
                editorRef.current.setViewByItem(mapItemRef.current, { lineHeight: val });
              }
            }}
            onBlur={() => {
              mapItemRef.current.setLineHeight(lineHeight);
            }}
            onPressEnter={() => lineHeightRef.current.blur() }
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

function getMenuItems(mapItem, intersectItems) {
  let menuItems = [];
  if (intersectItems.length > 1) {
    const index = intersectItems.indexOf(mapItem);
    const isBottom = index === 0;
    const isTop = index === intersectItems.length - 1;
    if (!isTop) {
      menuItems.push({
        label: '置于顶层',
        key: 'bringToFront',
      });
      menuItems.push({
        label: '上移一层',
        key: 'bringForward',
      });
    }
    if (!isBottom) {
      menuItems.push({
        label: '下移一层',
        key: 'sendBackwards',
      })
      menuItems.push({
        label: '置于底层',
        key: 'sendToBack',
      });
    }
  }
  
  menuItems.push({
    key: 'divider',
  });
  menuItems.push({
    label: '删除',
    key: 'delete',
  });
  return menuItems;
}
function ContextMenu({ showContextMenu, setShowContextMenu, contextMenuPosition, mapItemRef, editorRef }) {
  if (!showContextMenu) return null;

  const mapEditor = editorRef.current;
  const mapItem = mapItemRef.current;
  if (mapEditor == null || mapItem == null) return null;

  const intersectItems =  mapEditor.getIntersectItems(mapItem);
  const menuItems = getMenuItems(mapItem, intersectItems);

  const menuStyle = {
    left: contextMenuPosition.left,
    top: contextMenuPosition.top,
  };

  const handleClickMask = () => {
    setShowContextMenu(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(false);
  };

  const selectMenuItem = ({ key }) => {
    setShowContextMenu(false);
    if (key === 'delete') {
      mapEditor.remove(mapItem);
    } else if (key === 'bringForward') {
      const index = intersectItems.indexOf(mapItem);
      const target = intersectItems[index + 1];
      mapItem.levelUpAbove(target);
    } else if (key === 'bringToFront') {
      mapItem.levelUpAbove(intersectItems[intersectItems.length - 1]);
    } else if (key === 'sendBackwards') {
      const index = intersectItems.indexOf(mapItem);
      const target = intersectItems[index - 1];
      mapItem.levelDownBelow(target);
    } else if (key === 'sendToBack') {
      mapItem.levelDownBelow(intersectItems[0]);
    }
  };

  return createPortal(
    <div className="menu-mask" onClick={handleClickMask} onContextMenuCapture={handleContextMenu}>
      <div className="menu" style={menuStyle}>
        {menuItems.map((item, index) => {
          if (item.key === 'divider') {
            return <div className="menu-divier" key={`${item.key}-${index}`}></div>;
          } else {
            return <div className="menu-item" key={item.key} onClick={() => selectMenuItem(item)}>{item.label}</div>;
          }
        })}
      </div>
    </div>,
    document.body,
  );
}

export default App;
