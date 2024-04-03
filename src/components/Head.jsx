/* eslint-disable react/prop-types */
import { IconButton } from "./IconButton";
import { TOOL } from "../constants";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../context";
import { EVENT } from "../event";
import { Icon } from './Icon';

export function Head({ tool }) {
  const editor = useContext(EditorContext);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);


  const handleUndo = () => {
    if (!canUndo) return;
    editor.undo();
  };

  const handleRedo = () => {
    if (!canRedo) return;
    editor.redo();
  };

  const invokeTool = (tool) => {
    editor.invokeTool(tool);
  };

  useEffect(() => {
    if (!editor) return;

    setCanUndo(editor.canUndo());
    setCanRedo(editor.canRedo());

    const handleHistory = () => {
      setCanUndo(editor.canUndo());
      setCanRedo(editor.canRedo());
    };
    
    editor.on(EVENT.history, handleHistory);

    return () => {
      editor.off(EVENT.history, handleHistory);
    };
  }, [editor]);

  return (
    <div className="head">
      <div className="head-left">
        <IconButton
          name="undo"
          tooltip="撤销(Ctrl/Command + Z)"
          disabled={!canUndo}
          onClick={handleUndo}
        />
        <IconButton
          name="redo"
          tooltip="重做(Ctrl/Command + Shift + Z)"
          disabled={!canRedo}
          onClick={handleRedo}
        />
        <IconButton
          name="select"
          tooltip="选择(V键)"
          active={tool === TOOL.select}
          onClick={() => invokeTool(TOOL.select)}
        />
        <IconButton
          name="hand"
          tooltip="拖动(H键)"
          active={tool === TOOL.hand}
          onClick={() => invokeTool(TOOL.hand)}
        />
        <IconButton
          name="erase"
          tooltip="擦除(E键)"
          active={tool === TOOL.erase}
          onClick={() => invokeTool(TOOL.erase)}
        />
        <IconButton
          name="text"
          tooltip="文字(T键)"
          active={tool === TOOL.text}
          onClick={() => invokeTool(TOOL.text)}
        />
      </div>
      <div>地图编辑器 Demo</div>
      <div>
        <GithubButton />
      </div>
    </div>
  )
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
