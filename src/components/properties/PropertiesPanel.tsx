import React from "react";
import { useCanvasStore } from "@/store/canvasStore";
import { useRoomStore } from "@/store/roomStore";
import type { CanvasObject } from "@/types/canvas";

interface PropertiesPanelProps {
  objects: CanvasObject[];
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
}

export function PropertiesPanel({
  objects,
  updateObject,
  isOpenMobile,
  setIsOpenMobile,
}: PropertiesPanelProps) {
  const selectedObjectIds = useCanvasStore((state) => state.selectedObjectIds);
  const connectedUsers = useRoomStore((state) => state.connectedUsers);

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
    
    // Determine which color property to update based on object type
    const isText = selectedObject.type === "text";
    const colorKey = isText ? "textColor" : "backgroundColor";
    
    updateObject(selectedObject.id, {
      data: {
        ...selectedObject.data,
        [colorKey]: e.target.value,
      },
    });
  };

  const getActiveColor = () => {
    if (!selectedObject) return "#ffffff";
    const isText = selectedObject.type === "text";
    // @ts-ignore - we know these exist on the specific data types but TS union needs narrowing
    return isText ? selectedObject.data.textColor : selectedObject.data.backgroundColor;
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
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[32px] opacity-50">interests</span>
              <p className="text-xs">Select an object on the canvas to view its properties.</p>
            </div>
          )}
        </div>

        {/* Assets Section */}
        <div className="p-4 flex-1 overflow-y-auto border-b border-outline-variant/30">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-4">
            Assets
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDQxDNaGAAqGZgswkWu2yWYzIl14LpMqxmms5NYN07XxsgkxDM4tvNoH3DHQis_zWUTkDYRtJzVuWyX_Y8uftbvoGw_K9wIl5sSwg8IegUs-62OKteseTzs7yMiTzQtmukbh2PRm-D5NPi-JC2O6lXzurqbLpil4FVffxCKY_iAiz5HsyPtkOJpG_yM6vODRljJw95BAbIC2vRD2a8nMDUltMW8CTu6KuAjH0QCkcrtGQbXPf0o1zFnu29D4IfIlnzt2oN2k1nVB6M",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDAAdy4beUJk6-LGizTihbhVpZHqPDL9gXLRjRqkk8td19sltNqR2-9lKx0WxaT4PfQ3NXpifaGzhoChuFuAc8D8qWpzZy0-968-Xz1snnAxiHC3lp5QFwJHEHZlFPbT6xlF6jwStz2AmaeaT94SIruAtVquNCC2aseSIcKy2vCwvzxwBnWUUOXCAlZonAFUD4BGWcDhEpHV5tmk0J4RcAP9GI8JrXOr5XI1XRiIikrgue2zbS5XdZq9_6xF3chIssEMmzgEgmw0ek",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDKp9Mn2Dlj2QaMnHJJVpCnvWZ1NUJdv6LdmaHOgz-5u17Kbq_8pClTI-9CkJFHQJXhiXMAAYD6KTxwT3zDhFpE9eIelqPaKiEUiLuHPgQ9pLRBePh_m45Rtt_VyjUSbXMCmHgO54qTODFf0ROfBUUm78MB8FtHqJzZr33GIDpKFEIP589QFUEreswREaKd_sj2VNOpKH-ft14xiFoFhyPs793Ja7VnV3OM255bT4WrFHhIeGf8Qxf9y8C0xRLBm14c_OIBPa88Cro"
            ].map((src, i) => (
              <div 
                key={i} 
                className="aspect-square bg-slate-50 rounded-lg border border-slate-200 overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-colors"
              >
                <img 
                  className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" 
                  src={src} 
                  alt={`Asset ${i}`} 
                />
              </div>
            ))}
            <div className="aspect-square bg-slate-50 rounded-lg border border-slate-200 border-dashed overflow-hidden flex items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors text-slate-400 hover:text-primary">
              <span className="material-symbols-outlined">add</span>
            </div>
          </div>
        </div>

        {/* Collaborators Section */}
        <div className="p-4 bg-slate-50 mt-auto shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">Collaborators</span>
          </div>
          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
            {connectedUsers.length === 0 ? (
              <div className="text-xs text-slate-500 italic">No one else is here.</div>
            ) : (
              connectedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: user.color || '#0061a5' }}
                  />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {user.username}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
