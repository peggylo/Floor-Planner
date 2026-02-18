import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { DraggableFurniture } from './components/DraggableFurniture';
import { ITEM_DEFS, type ItemType, type PlacedItem, type SavedLayout } from './types';
import { RotateCw, Trash2, Download, ZoomIn, ZoomOut, Copy } from 'lucide-react';
import './App.css';

const STORAGE_KEY = 'space-m-current';
const LAYOUTS_KEY = 'space-m-layouts';

const App: React.FC = () => {
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState(0);
  const [clipboard, setClipboard] = useState<PlacedItem[] | null>(null);
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [currentLayoutName, setCurrentLayoutName] = useState('');

  // Selection box state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const isDraggingSelectionRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCurrent = localStorage.getItem(STORAGE_KEY);
      if (savedCurrent) {
        const parsed = JSON.parse(savedCurrent);
        setItems(parsed.items || []);
        setCurrentLayoutName(parsed.name || '');
      }
      const savedLayouts = localStorage.getItem(LAYOUTS_KEY);
      if (savedLayouts) {
        setSavedLayouts(JSON.parse(savedLayouts));
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    isInitializedRef.current = true;
  }, []);

  // Auto-save to localStorage when items change
  useEffect(() => {
    if (!isInitializedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, name: currentLayoutName }));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [items, currentLayoutName]);

  // Save layouts list to localStorage
  useEffect(() => {
    if (!isInitializedRef.current) return;
    try {
      localStorage.setItem(LAYOUTS_KEY, JSON.stringify(savedLayouts));
    } catch (e) {
      console.error('Failed to save layouts:', e);
    }
  }, [savedLayouts]);

  // Save current layout to a named slot
  const handleSaveLayout = useCallback((name: string) => {
    const newLayout: SavedLayout = {
      id: uuidv4(),
      name,
      items: [...items],
      savedAt: Date.now(),
    };
    setSavedLayouts(prev => [...prev, newLayout]);
    setCurrentLayoutName(name);
  }, [items]);

  // Load a saved layout
  const handleLoadLayout = useCallback((id: string) => {
    const layout = savedLayouts.find(l => l.id === id);
    if (layout) {
      setItems(layout.items);
      setCurrentLayoutName(layout.name);
      setSelectedIds(new Set());
    }
  }, [savedLayouts]);

  // Delete a saved layout
  const handleDeleteLayout = useCallback((id: string) => {
    setSavedLayouts(prev => prev.filter(l => l.id !== id));
  }, []);

  // Export current layout as JSON
  const handleExportJSON = useCallback(() => {
    const data = {
      name: currentLayoutName || '未命名配置',
      items,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `space-m-layout-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [items, currentLayoutName]);

  // Import layout from JSON file
  const handleImportJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          setCurrentLayoutName(data.name || '匯入的配置');
          setSelectedIds(new Set());
        } else {
          alert('無效的配置檔案格式');
        }
      } catch (err) {
        alert('無法讀取配置檔案');
      }
    };
    reader.readAsText(file);
  }, []);

  // Clear all items
  const handleClearAll = useCallback(() => {
    if (items.length === 0 || confirm('確定要清空所有物件嗎？')) {
      setItems([]);
      setSelectedIds(new Set());
      setCurrentLayoutName('');
    }
  }, [items.length]);

  // Calculate counts
  const counts = items.reduce((acc, item) => {
    if (item.type !== 'text') {
      acc[item.type] = (acc[item.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<ItemType, number>);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.2));

  const handleAdd = (type: ItemType) => {
    // Default position near the top-left area of the floor plan
    let initialX = 400;
    let initialY = 300;

    if (workspaceRef.current && containerRef.current) {
      const bgImage = containerRef.current.querySelector('img') as HTMLImageElement;

      if (bgImage) {
        // Get the displayed size of the background image
        const displayedWidth = bgImage.offsetWidth;
        const displayedHeight = bgImage.offsetHeight;

        const workspaceRect = workspaceRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate center of the visible workspace in screen coordinates
        const viewportCenterX = workspaceRect.left + workspaceRect.width / 2;
        const viewportCenterY = workspaceRect.top + workspaceRect.height / 2;

        // Calculate position relative to the container (which is scaled)
        // We use the container's position (rect) to handle scroll and flex alignment automatically
        // containerRect.left/top includes the effect of scroll and padding
        const relativeX = viewportCenterX - containerRect.left;
        const relativeY = viewportCenterY - containerRect.top;

        // Convert to unscaled coordinates
        // Since the container uses transform: scale(), the internal coordinates are:
        // internal = displayed_offset / scale
        const unscaledX = relativeX / scale;
        const unscaledY = relativeY / scale;

        // Clamp to image boundaries with some padding
        // If the viewport is outside the image (e.g. looking at empty padding), this pulls it back in
        initialX = Math.max(100, Math.min(displayedWidth - 100, unscaledX));
        initialY = Math.max(100, Math.min(displayedHeight - 100, unscaledY));
      }
    }

    const newItem: PlacedItem = {
      id: uuidv4(),
      type,
      x: initialX + (Math.random() * 20 - 10),
      y: initialY + (Math.random() * 20 - 10),
      rotation: 0,
    };

    if (type === 'text') {
      newItem.text = '點擊編輯';
    }

    setItems([...items, newItem]);
    setSelectedIds(new Set([newItem.id]));
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, x, y } : item
    ));
  };

  // Batch move all selected items by delta
  const handleBatchDrag = (draggedId: string, deltaX: number, deltaY: number) => {
    if (!selectedIds.has(draggedId) || selectedIds.size <= 1) return;

    setItems(prev => prev.map(item => {
      // Move all selected items except the one being dragged (it moves itself)
      if (selectedIds.has(item.id) && item.id !== draggedId) {
        return { ...item, x: item.x + deltaX, y: item.y + deltaY };
      }
      return item;
    }));
  };

  const updateText = (id: string, text: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  // Selection Logic
  const handleSelect = (id: string, multiSelect: boolean) => {
    if (multiSelect) {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const handleCreateSelectionBox = (e: React.MouseEvent) => {
    // Only start selection if clicking on background areas
    // Items call stopPropagation on mouseDown, so if we get here it's a background click
    if (!containerRef.current || !workspaceRef.current) return;

    // Prevent default to avoid text selection
    e.preventDefault();

    // Get mouse pos relative to workspace
    const rect = workspaceRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + workspaceRef.current.scrollLeft;
    const y = e.clientY - rect.top + workspaceRef.current.scrollTop;

    setIsSelecting(true);
    isDraggingSelectionRef.current = false;
    setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
  };

  const handleUpdateSelectionBox = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionBox || !workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + workspaceRef.current.scrollLeft;
    const y = e.clientY - rect.top + workspaceRef.current.scrollTop;

    // Check if moved significantly to consider it a drag
    if (Math.abs(x - selectionBox.startX) > 5 || Math.abs(y - selectionBox.startY) > 5) {
      isDraggingSelectionRef.current = true;
    }

    setSelectionBox(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  const handleEndSelectionBox = () => {
    if (isSelecting && selectionBox && workspaceRef.current && containerRef.current) {
      if (!isDraggingSelectionRef.current) {
        // If it was just a click (no drag), don't do selection logic here
        setIsSelecting(false);
        setSelectionBox(null);
        return;
      }

      // 1. Calculate Selection Box in SCREEN Coordinates
      // selectionBox.startX is (clientX - workspaceRect.left + scrollLeft at start)
      // So ClientX_Start = workspaceRect.left + startX - scrollLeft_Current? No.
      // Actually, let's just use the stored coordinates which are in "Workspace Layout Space".
      const startX = Math.min(selectionBox.startX, selectionBox.currentX);
      const endX = Math.max(selectionBox.startX, selectionBox.currentX);
      const startY = Math.min(selectionBox.startY, selectionBox.currentY);
      const endY = Math.max(selectionBox.startY, selectionBox.currentY);

      // 2. We need to convert Item coordinates to "Workspace Layout Space" to compare.
      // Or easier: Convert everything back to Visual Client Coordinates?
      // Let's stick toWorkspace Layout Space (which includes scroll).

      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Container offset in Workspace Layout Space
      // The container moves when we scroll. 
      // containerRect.left is relative to viewport.
      // workspaceRect.left is relative to viewport.
      // workspace.scrollLeft is the scroll amount.
      // Container_X_in_Layout = (containerRect.left - workspaceRect.left) + workspaceRef.current.scrollLeft

      const containerLayoutX = (containerRect.left - workspaceRect.left) + workspaceRef.current.scrollLeft;
      const containerLayoutY = (containerRect.top - workspaceRect.top) + workspaceRef.current.scrollTop;

      const selected = items.filter(item => {
        // Calculate Item Bounds in Workspace Layout Space
        const def = item.type === 'text' ? null : ITEM_DEFS[item.type as Exclude<ItemType, 'text'>];
        const w = (def?.width || (item.type === 'text' ? 100 : 50)) * scale;
        const h = (def?.height || (item.type === 'text' ? 40 : 50)) * scale;

        const itemLayoutX = item.x * scale + containerLayoutX;
        const itemLayoutY = item.y * scale + containerLayoutY;

        // Check center point
        const centerX = itemLayoutX + w / 2;
        const centerY = itemLayoutY + h / 2;

        return centerX >= startX && centerX <= endX && centerY >= startY && centerY <= endY;
      });

      setSelectedIds(new Set(selected.map(i => i.id)));
    }
    setIsSelecting(false);
    setSelectionBox(null);
  };

  const handleDelete = () => {
    if (selectedIds.size > 0) {
      setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
    }
  };

  const handleRotate = () => {
    if (selectedIds.size > 0) {
      setItems(prev => prev.map(item =>
        selectedIds.has(item.id) ? { ...item, rotation: (item.rotation + 45) % 360 } : item
      ));
    }
  };

  const handleCopy = () => {
    const selectedItems = items.filter(item => selectedIds.has(item.id));
    if (selectedItems.length > 0) {
      setClipboard(selectedItems);
    }
  };

  const handlePaste = () => {
    if (!clipboard || clipboard.length === 0) return;

    // Check limits (optional but requested)
    // We should count how many of each type we are adding vs available
    // But allow paste and show warning or just clamp is hard. 
    // Let's just paste for now, the UI shows counts turning red if over limit anyway.

    const newItems = clipboard.map(item => ({
      ...item,
      id: uuidv4(),
      x: item.x + 20, // Offset slightly
      y: item.y + 20
    }));

    setItems(prev => [...prev, ...newItems]);

    // Select the newly pasted items
    const newIds = new Set(newItems.map(i => i.id));
    setSelectedIds(newIds);
  };

  const handleDuplicate = () => {
    // Shortcut for Copy+Paste immediately
    const selectedItems = items.filter(item => selectedIds.has(item.id));
    if (selectedItems.length === 0) return;

    const newItems = selectedItems.map(item => ({
      ...item,
      id: uuidv4(),
      x: item.x + 20,
      y: item.y + 20
    }));
    setItems(prev => [...prev, ...newItems]);
    setSelectedIds(new Set(newItems.map(i => i.id)));
  };

  const handleExport = async () => {
    if (containerRef.current) {
      setSelectedIds(new Set()); // Deselect
      // Wait for render
      await new Promise(r => setTimeout(r, 100));

      // Get container dimensions for positioning
      const bgImage = containerRef.current.querySelector('img') as HTMLImageElement;
      const containerWidth = bgImage ? bgImage.offsetWidth : containerRef.current.scrollWidth;
      const containerHeight = bgImage ? bgImage.offsetHeight : containerRef.current.scrollHeight;

      // Create legend element - positioned at bottom-right using left/top instead of right/bottom
      const legend = document.createElement('div');
      legend.id = 'export-legend';
      const legendWidth = 280; // Approximate legend width
      const legendHeight = 320; // Approximate legend height
      legend.style.cssText = `
        position: absolute;
        left: ${containerWidth - legendWidth - 40}px;
        top: ${containerHeight - legendHeight - 40}px;
        background: rgba(255, 255, 255, 0.98);
        border: 3px solid #d1d5db;
        border-radius: 12px;
        padding: 32px;
        font-family: sans-serif;
        font-size: 28px;
        z-index: 1000;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      `;
      legend.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 24px; font-size: 32px; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px;">圖例說明</div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 80px; height: 32px; background: #34d399; border: 3px solid #059669; border-radius: 6px;"></div>
            <span>IBM桌</span>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 80px; height: 32px; background: #f87171; border: 3px solid #b91c1c; border-radius: 6px;"></div>
            <span>電資學院桌</span>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 40px; height: 40px; background: #9ca3af; border: 3px solid #6b7280; border-radius: 50%;"></div>
            <span>白色椅子</span>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 40px; height: 40px; background: #8D6E63; border: 3px solid #5D4037; border-radius: 50%;"></div>
            <span>咖啡色椅子</span>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" fill="#1f2937" stroke="#000000" stroke-width="2"/></svg>
            <span>高腳椅</span>
          </div>
        </div>
      `;
      containerRef.current.appendChild(legend);

      // Wait for legend to render
      await new Promise(r => setTimeout(r, 50));

      const scrollWidth = containerRef.current.scrollWidth;
      const scrollHeight = containerRef.current.scrollHeight;

      const dataUrl = await htmlToImage.toPng(containerRef.current, {
        backgroundColor: 'white',
        width: scrollWidth, // Force full width capture
        height: scrollHeight, // Force full height capture
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${scrollWidth}px`,
          height: `${scrollHeight}px`
        }
      });

      // Remove legend after export
      legend.remove();

      const link = document.createElement('a');
      link.download = 'space-m-layout.png';
      link.href = dataUrl;
      link.click();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          handleCopy();
        } else if (e.key === 'v') {
          handlePaste();
        } else if (e.key === 'd') {
          e.preventDefault(); // Prevent browser bookmark
          handleDuplicate();
        }
      } else {
        if (selectedIds.size > 0) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            handleDelete();
          } else if (e.key === 'r' || e.key === 'R') {
            handleRotate();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, items, clipboard]); // Include dependencies for closure state

  return (
    <div className="app-container" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        counts={counts}
        onAdd={handleAdd}
        savedLayouts={savedLayouts}
        currentLayoutName={currentLayoutName}
        onSaveLayout={handleSaveLayout}
        onLoadLayout={handleLoadLayout}
        onDeleteLayout={handleDeleteLayout}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onClearAll={handleClearAll}
      />

      <div
        ref={workspaceRef}
        className="workspace"
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#e5e5e5',
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px',
          userSelect: 'none' // Prevent text selection during drag
        }}
        onClick={() => {
          // Background click deselects, unless we just finished a drag selection
          if (isDraggingSelectionRef.current) {
            isDraggingSelectionRef.current = false;
            return;
          }
          setSelectedIds(new Set());
        }}
        onMouseDown={handleCreateSelectionBox}
        onMouseMove={handleUpdateSelectionBox}
        onMouseUp={handleEndSelectionBox}
        onMouseLeave={handleEndSelectionBox}
      >
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: 'fit-content',
            height: 'fit-content',
            minWidth: '800px',
            minHeight: '600px',
            boxShadow: 'var(--shadow-xl)',
            backgroundColor: 'white',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            transition: isSelecting ? 'none' : 'transform 0.1s ease-out',
            opacity: scale === 0 ? 0 : 1
          }}
          onClick={(e) => e.stopPropagation()} // Stop click bubbling to workspace
        // onMouseDown={(e) => e.stopPropagation()} // Removed to allow starting selection on map
        >
          {/* Background Map */}
          <img
            src={`${import.meta.env.BASE_URL}bg.jpg`}
            alt="Floor Plan"
            style={{
              display: 'block',
              maxWidth: 'none',
              cursor: 'crosshair',
            }}
            draggable={false}
            onLoad={(e) => {
              if (scale === 0 && workspaceRef.current) {
                const img = e.currentTarget;
                const ws = workspaceRef.current;
                const padding = 80;
                const fitScale = Math.min(
                  (ws.clientWidth - padding) / img.naturalWidth,
                  (ws.clientHeight - padding) / img.naturalHeight
                );
                setScale(fitScale);
              }
            }}
          />

          {items.map(item => (
            <DraggableFurniture
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              scale={scale}
              onSelect={(multi) => handleSelect(item.id, multi)}
              onUpdatePosition={(x, y) => updatePosition(item.id, x, y)}
              onDrag={(deltaX, deltaY) => handleBatchDrag(item.id, deltaX, deltaY)}
              onUpdateText={item.type === 'text' ? (text) => updateText(item.id, text) : undefined}
            />
          ))}
        </div>

        {/* Selection Box Overlay */}
        {isSelecting && selectionBox && (
          <div style={{
            position: 'absolute',
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
            border: '2px dashed #3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            pointerEvents: 'none',
            zIndex: 999
          }} />
        )}
      </div>

      {/* Floating Action Bar */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--color-surface-hover)',
        padding: '12px 24px',
        borderRadius: '50px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        gap: '16px',
        zIndex: 200,
        backdropFilter: 'blur(8px)',
        border: 'var(--glass-border)',
        alignItems: 'center'
      }}>
        {selectedIds.size > 0 ? (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handleRotate(); }}
              title="Rotate (R)"
              style={{ background: 'none', border: 'none', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}
            >
              <RotateCw size={24} />
              <span>旋轉</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}
              title="Duplicate (Ctrl+D)"
              style={{ background: 'none', border: 'none', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}
            >
              <Copy size={24} />
              <span>複製</span>
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              title="Delete (Del)"
              style={{ background: 'none', border: 'none', color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}
            >
              <Trash2 size={24} />
              <span>刪除</span>
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />
          </>
        ) : null}

        {/* Always Visible Tools */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          style={{ background: 'none', border: 'none', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}
        >
          <ZoomIn size={24} />
          <span>放大</span>
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{ background: 'none', border: 'none', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}
        >
          <ZoomOut size={24} />
          <span>縮小</span>
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />

        <button
          onClick={handleExport}
          title="Download Image"
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}
        >
          <Download size={24} />
          <span>下載圖檔</span>
        </button>
      </div>
    </div>
  );
};

export default App;
