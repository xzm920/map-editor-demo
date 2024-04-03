/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_LINE_HEIGHT, MAP_ITEM_TYPE, TEXT_ALIGN } from "../constants";
import { Checkbox, ColorPicker, InputNumber, Slider } from "antd";
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, BoldOutlined, ItalicOutlined, UnderlineOutlined } from "@ant-design/icons";
import { EditorContext, MapItemContext } from "../context";
import { EVENT } from "../event";

export function PropertyPannel() {
  const editor = useContext(EditorContext);
  const mapItem = useContext(MapItemContext);

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!editor) return;
    
    setSelected(mapItem ? { ...mapItem } : null);

    const handleUpdate = ({ item }) => {
      if (item === mapItem) {
        setSelected(item ? { ...item } : null);
      }
    };
    
    const handleToggleMaskPlayer = ({ mapItem: item }) => {
      if (item === mapItem) {
        setSelected(item ? { ...item } : null);
      }
    };

    editor.on(EVENT.update, handleUpdate);
    editor.on(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);
  
    return () => {
      editor.off(EVENT.update, handleUpdate);
      editor.off(EVENT.toggleMaskPlayer, handleToggleMaskPlayer);
    };
  }, [editor, mapItem]);

  let detail = null;
  if (!selected) {
    detail = null;
  } else if (selected.type === MAP_ITEM_TYPE.image) {
    detail = <ImageDetail selected={selected} />;
  } else if (selected.type === MAP_ITEM_TYPE.text) {
    detail = <TextDetail selected={selected} />;
  } else if (selected.type === MAP_ITEM_TYPE.tiledObject) {
    detail = <TiledDetail selected={selected} />
  } else {
    detail = <BaseDetail selected={selected} />
  }

  return (
    <div className="property">
      {detail}
    </div>
  );
}

function BaseDetail({ selected }) {
  return (
    <div className="detail">
      <div>
        <div>{selected.name}</div>
        <div>
          <img className="detail-image" src={selected.imageURL} />
        </div>
      </div>
    </div>
  );
}

function TiledDetail({ selected }) {
  const mapItem = useContext(MapItemContext);

  return (
    <div className="detail">
      <div>
        <div>{selected.name}</div>
        <div>
          <img className="detail-image" src={selected.imageURL} />
        </div>
      </div>
      <div>
        <div>基本属性</div>
        <div>
          <Checkbox
            checked={selected.isMaskPlayer}
            disabled={selected.isCollider}
            onChange={() => mapItem.toggleMaskPlayer()}
          >遮挡人物</Checkbox>
        </div>
        <div>
          <Checkbox
            checked={selected.isCollider}
            disabled={selected.isMaskPlayer}
            onChange={() => mapItem.toggleCollider()}
          >人物不可通过</Checkbox>
        </div>
      </div>
    </div>
  );
}

function ImageDetail({ selected }) {
  const editor = useContext(EditorContext);
  const mapItem = useContext(MapItemContext);

  const [opacity, setOpacity] = useState(selected.opacity * 100);

  useEffect(() => {
    setOpacity(selected.opacity * 100);
  }, [selected.opacity]);

  return (
    <div className="detail">
      <div>
        <div>{selected.name}</div>
        <div>
          <img className="detail-image" src={selected.imageURL} />
        </div>
      </div>
      <div>
        <div>贴图效果</div>
        <div>
          <Slider
            value={opacity}
            onChange={(val) => {
              setOpacity(val);
              editor.setViewByItem(selected, { opacity: val / 100 });
            }}
            onChangeComplete={(val) => mapItem.setOpacity(val / 100)}
          />
        </div>
      </div>
      <div>
        <div>基本属性</div>
        <div>
          <Checkbox
            checked={selected.isMaskPlayer}
            onChange={() => mapItem.toggleMaskPlayer()}
          >遮挡人物</Checkbox>
        </div>
      </div>
    </div>
  );
}

function TextDetail({ selected }) {
  const editor = useContext(EditorContext);
  const mapItem = useContext(MapItemContext);

  const fontSizeRef = useRef();
  const lineHeightRef = useRef();

  const [opacity, setOpacity] = useState(selected.opacity * 100);
  const [color, setColor] = useState(selected.color);
  const [fontSize, setFontSize] = useState(selected.fontSize);
  const [lineHeight, setLineHeight] = useState(selected.lineHeight);

  useEffect(() => {
    setOpacity(selected.opacity * 100);
  }, [selected.opacity]);

  useEffect(() => {
    setColor(selected.color);
  }, [selected.color]);

  useEffect(() => {
    setFontSize(selected.fontSize);
  }, [selected.fontSize]);
  

  useEffect(() => {
    setLineHeight(selected.lineHeight);
  }, [selected.lineHeight]);

  const handleOpacityChange = (val) => {
    setOpacity(val);
    editor.setViewByItem(mapItem, { opacity: val / 100 });
  };

  const handleOpacityComplete = (val) => {
    mapItem.setOpacity(val / 100);
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
              editor.setViewByItem(mapItem, { color: hex });
            }}
            onChangeComplete={(color) => mapItem.setColor(color.toHexString()) }
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
                editor.setViewByItem(mapItem, { fontSize: val });
              }
            }}
            onBlur={() => {
              if (fontSize === null || fontSize < 10 || fontSize > 64) {
                setFontSize(selected.fontSize);
              } else {
                mapItem.setFontSize(fontSize);
              }
            }}
            onPressEnter={() => fontSizeRef.current.blur() }
          />
        </div>
        <div>
          <ItalicOutlined
            className={`icon ${selected.isItalic ? 'active' : ''}`}
            onClick={() => mapItem.setItalic(!mapItem.isItalic) }
          />
          <BoldOutlined
            className={`icon ${selected.isBold ? 'active' : ''}`}
            onClick={() => mapItem.setBold(!mapItem.isBold) }
          />
          <UnderlineOutlined
            className={`icon ${selected.isUnderline ? 'active' : ''}`}
            onClick={() => mapItem.setUnderline(!mapItem.isUnderline) }
          />
        </div>
        <div>
          <AlignLeftOutlined
            className={`icon ${selected.horizontalAlign === TEXT_ALIGN.left ? 'active' : ''}`}
            onClick={() => mapItem.setTextAlign(TEXT_ALIGN.left) }
          />
          <AlignCenterOutlined
            className={`icon ${selected.horizontalAlign === TEXT_ALIGN.center ? 'active' : ''}`}
            onClick={() => mapItem.setTextAlign(TEXT_ALIGN.center) }
          />
          <AlignRightOutlined
            className={`icon ${selected.horizontalAlign === TEXT_ALIGN.right ? 'active' : ''}`}
            onClick={() => mapItem.setTextAlign(TEXT_ALIGN.right) }
          />
        </div>
        <div>
          <InputNumber
            ref={lineHeightRef}
            value={lineHeight}
            min={1}
            placeholder={lineHeight === null ? (DEFAULT_LINE_HEIGHT * fontSize).toFixed(2) : ''}
            onChange={(val) => {
              setLineHeight(val);
              if (val >= 10 && val <= 64) {
                editor.setViewByItem(mapItem, { lineHeight: val });
              }
            }}
            onBlur={() => {
              mapItem.setLineHeight(lineHeight);
            }}
            onPressEnter={() => lineHeightRef.current.blur() }
          />
        </div>
      </div>
      <div>
        <div>基本属性</div>
        <div>
          <Checkbox
            checked={selected.isMaskPlayer}
            onChange={() => mapItem.toggleMaskPlayer()}
          >遮挡人物</Checkbox>
        </div>
      </div>
    </div>
  );
}
