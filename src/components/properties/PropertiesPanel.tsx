import React, { useState, useRef } from "react";
import { useCanvasStore } from "@/store/canvasStore";
import type { CanvasObject } from "@/types/canvas";

interface PropertiesPanelProps {
  objects: CanvasObject[];
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
  assets?: string[];
  addAsset?: (url: string) => void;
  removeAsset?: (index: number) => void;
  onAssetClick?: (url: string) => void;
}

export function PropertiesPanel({
  objects,
  updateObject,
  isOpenMobile,
  setIsOpenMobile,
  assets = [],
  addAsset,
  removeAsset,
  onAssetClick,
}: PropertiesPanelProps) {
  const selectedObjectIds = useCanvasStore((state) => state.selectedObjectIds);
  const selectObject = useCanvasStore((state) => state.selectObject);
  const [currentPage, setCurrentPage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(assets.length / itemsPerPage);
  const currentAssets = assets.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (addAsset && src) {
        addAsset(src);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDragStart = (e: React.DragEvent, src: string) => {
    e.dataTransfer.setData('text/plain', src);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const moveLayerUp = (index: number) => {
    if (index >= objects.length - 1) return; // Already on top
    const currentObj = objects[index];
    const nextObj = objects[index + 1];
    if (!currentObj || !nextObj) return;
    
    const currentZ = currentObj.zIndex || index;
    const nextZ = nextObj.zIndex || index + 1;
    
    updateObject(currentObj.id, { zIndex: nextZ });
    updateObject(nextObj.id, { zIndex: currentZ });
  };

  const moveLayerDown = (index: number) => {
    if (index <= 0) return; // Already on bottom
    const currentObj = objects[index];
    const prevObj = objects[index - 1];
    if (!currentObj || !prevObj) return;
    
    const currentZ = currentObj.zIndex || index;
    const prevZ = prevObj.zIndex || index - 1;
    
    updateObject(currentObj.id, { zIndex: prevZ });
    updateObject(prevObj.id, { zIndex: currentZ });
  };

  // For now, we only show properties if exactly ONE object is selected
  const selectedObject =
    selectedObjectIds.length === 1
      ? objects.find((obj) => obj.id === selectedObjectIds[0])
      : null;

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedObject) return;
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) updateObject(selectedObject.id, { x: val });
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedObject) return;
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) updateObject(selectedObject.id, { y: val });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedObject) return;
    const isText = selectedObject.type === "text";

    if (isText) {
      updateObject(selectedObject.id, {
        data: {
          ...selectedObject.data,
          color: e.target.value,
        },
      });
    } else {
      updateObject(selectedObject.id, {
        data: {
          ...selectedObject.data,
          fill: e.target.value,
        },
      });
    }
  };

  const handleFormatText = (command: string, value?: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    const selection = window.getSelection();
    if (selection && selection.anchorNode && selection.anchorNode.parentElement) {
      selection.anchorNode.parentElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const getActiveColor = () => {
    if (!selectedObject) return "#ffffff";
    const isText = selectedObject.type === "text";
    // @ts-ignore
    return isText ? (selectedObject.data.color || "#E2E8F0") : selectedObject.data.fill;
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value) || 18;
    if (selectedObject && selectedObject.type === 'text') {
      updateObject(selectedObject.id, {
        data: {
          ...selectedObject.data,
          fontSize: size,
        },
      });
    }
  };

  const getLayerName = () => {
    if (!selectedObject) return "";
    return selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1);
  };

  const panelClasses = `fixed top-16 bottom-0 right-0 w-[280px] bg-white border-l border-outline-variant/30 z-40 flex flex-col transition-transform duration-300 ease-in-out ${
    isOpenMobile ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
  }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={panelClasses}>
        {/* Properties Section */}
        <div className="p-4 border-b border-outline-variant/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              Properties
            </h4>
            <button 
              className="lg:hidden p-1 hover:bg-slate-100 rounded-full text-slate-500"
              onClick={() => setIsOpenMobile(false)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {selectedObject ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Layer Type
                </label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium">
                  {getLayerName()}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedObject.x)}
                    onChange={handleXChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedObject.y)}
                    onChange={handleYChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedObject.type === "text" ? "Text Color" : "Fill"}
                </label>
                <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <input
                    type="color"
                    value={getActiveColor() || "#ffffff"}
                    onChange={handleColorChange}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <span className="text-sm font-mono text-slate-600 uppercase">
                    {getActiveColor() || "#ffffff"}
                  </span>
                </div>
              </div>

              {selectedObject.type === "text" && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Text Formatting
                  </label>
                  <div className="flex items-center gap-2">
                    <button 
                      onMouseDown={(e) => { e.preventDefault(); handleFormatText('bold'); }}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-100 font-bold"
                    >
                      B
                    </button>
                    <button 
                      onMouseDown={(e) => { e.preventDefault(); handleFormatText('italic'); }}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-100 italic font-serif"
                    >
                      I
                    </button>
                    <button 
                      onMouseDown={(e) => { e.preventDefault(); handleFormatText('underline'); }}
                      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-100 underline"
                    >
                      U
                    </button>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white h-8 ml-2">
                      <input 
                        type="number"
                        className="w-12 h-full text-center text-sm border-none focus:outline-none"
                        value={(selectedObject.data as any).fontSize || 18}
                        onChange={handleFontSizeChange}
                      />
                      <span className="text-xs text-slate-400 pr-2 pointer-events-none">px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[32px] opacity-50">interests</span>
              <p className="text-xs">Select an object on the canvas to view its properties.</p>
            </div>
          )}
        </div>

        {/* Layers Section */}
        <div className="p-4 border-b border-outline-variant/30 flex flex-col max-h-[300px] overflow-y-auto">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">
            Layers
          </h4>
          <div className="flex flex-col gap-1">
            {/* Render in reverse so top layers are at the top of the list */}
            {[...objects].reverse().map((obj, reversedIndex) => {
              const originalIndex = objects.length - 1 - reversedIndex;
              const isSelected = selectedObjectIds.includes(obj.id);
              let icon = "interests";
              if (obj.type === "text") icon = "title";
              if (obj.type === "image") icon = "image";
              
              return (
                <div 
                  key={obj.id}
                  onClick={() => selectObject(obj.id, false)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      {icon}
                    </span>
                    <span className="text-xs text-slate-700 truncate">
                      {obj.type === 'text' ? (obj.data as any).content?.replace(/<[^>]+>/g, '').substring(0, 15) || 'Text' : obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveLayerUp(originalIndex); }}
                      disabled={originalIndex === objects.length - 1}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-500"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveLayerDown(originalIndex); }}
                      disabled={originalIndex === 0}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-500"
                    >
                      <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {objects.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-2">No layers yet</div>
            )}
          </div>
        </div>

        {/* Assets Section */}
        <div className="p-4 flex-1 overflow-y-auto border-b border-outline-variant/30 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
              Assets
            </h4>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 disabled:opacity-50 hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 disabled:opacity-50 hover:bg-slate-200"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currentAssets.map((src, i) => {
              const actualIndex = currentPage * itemsPerPage + i;
              return (
                <div 
                  key={actualIndex} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, src)}
                  onClick={() => onAssetClick && onAssetClick(src)}
                  className="aspect-square bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <img 
                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" 
                    src={src} 
                    alt={`Asset ${actualIndex}`} 
                  />
                  {removeAsset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAsset(actualIndex);
                      }}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-1 bg-black/50 text-white text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Click or Drag
                  </div>
                </div>
              );
            })}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-slate-50 rounded-lg border border-slate-200 border-dashed overflow-hidden flex items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors text-slate-400 hover:text-primary"
            >
              <span className="material-symbols-outlined">add</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            className="hidden" 
            accept="image/*" 
          />
        </div>
      </aside>
    </>
  );
}
