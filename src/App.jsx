/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { ConfigProvider } from "antd";
import { throttle } from "lodash";
import { MapEditor } from "./mapEditor";
import { materials } from "../mock/materials";
import { resources } from '../mock/resources';
import { TILE_SIZE, TOOL } from "./constants";
import { createBackgroundImageFromResource, createMapItemFromMaterial, createText } from "./model/create";
import { EVENT } from "./event";
import { EditorContext, MapItemContext } from "./context";
import { PropertyPannel } from "./components/PropertyPannel";
import { ContextMenu } from "./components/ContextMenu";
import { MaterialLibrary } from "./components/MaterialLibrary";
import { Head } from "./components/Head";
import { ZoomControl } from "./components/ZoomControl";
import { ViewControl } from "./components/ViewControl";

function App() {
  const canvasWrapper = useRef();

  const [editor, setEditor] = useState(null);
  const [mapItem, setMapItem] = useState(null);
  
  const [tool, setTool] = useState(null);
  const [showMask, setShowMask] = useState(false);

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
    setEditor(mapEditor);
    setTool(mapEditor.currentTool);

    _initMap(mapEditor);

    const handleToggleMask = () => {
      setShowMask(mapEditor.showMask);
    };
    
    const handleToolChange = ({ tool }) => {
      setTool(tool);
    };

    const handleSelectionChange = ({ items }) => {
      if (items.length === 1) {
        setMapItem(items[0]);
      } else {
        setMapItem(null);
      }
    };
    
    const handleResize = throttle(() => {
      const { clientWidth, clientHeight } = canvasWrapper.current;
      mapEditor.setCanvasSize(clientWidth, clientHeight);
    }, 300, { trailing: true });

    mapEditor.on(EVENT.toggleMask, handleToggleMask);
    mapEditor.on(EVENT.toolChange, handleToolChange);
    mapEditor.on(EVENT.selectionChange, handleSelectionChange);
    window.addEventListener('resize', handleResize);
    
    return () => {
      mapEditor.off(EVENT.toggleMask, handleToggleMask);
      mapEditor.off(EVENT.toolChange, handleToolChange);
      mapEditor.off(EVENT.selectionChange, handleSelectionChange);
      window.removeEventListener('resize', handleResize);

      mapEditor.dispose();
    };
  }, []);

  const handleShowMaskChange = () => {
    editor.toggleMask();
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#8f7ef4'
        }
      }}
    >
      <EditorContext.Provider value={editor}>
        <MapItemContext.Provider value={mapItem}>
          <div className="app">
            <Head tool={tool} />
            <div className="body">
              <MaterialLibrary
                showMask={showMask}
                onShowMaskChange={handleShowMaskChange}
              />
              <div className="canvas-wrapper" ref={canvasWrapper}>
                <canvas id="canvas"></canvas>
                <ViewControl
                  showEffectDisabled={showMask}
                  alignTileVisible={tool === TOOL.select}
                />
                <ZoomControl />
                <ContextMenu />
              </div>
              <PropertyPannel />
            </div>
          </div>
        </MapItemContext.Provider>
      </EditorContext.Provider>
    </ConfigProvider>
  );
}

export default App;

function _initMap(mapEditor) {
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
  });
  // debug
  window.mapEditor = mapEditor;
  window.materials = materials;
}
