/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { EditorContext, MapItemContext } from "../context";
import { createPortal } from "react-dom";
import { EVENT } from "../event";

export function ContextMenu() {
  const editor = useContext(EditorContext);
  const mapItem = useContext(MapItemContext);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  
  useEffect(() => {
    if (!editor) return;

    const handleContextMenu = ({ position }) => {
      setShowContextMenu(true);
      setContextMenuPosition(position);
    };

    editor.on(EVENT.contextMenu, handleContextMenu);

    return () => {
      editor.off(EVENT.contextMenu, handleContextMenu);
    };
  }, [editor]);

  if (!showContextMenu) return null;

  if (editor == null || mapItem == null) return null;

  const intersectItems =  editor.getIntersectItems(mapItem);
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
      editor.remove(mapItem);
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
