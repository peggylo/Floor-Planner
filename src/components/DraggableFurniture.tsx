import React, { useRef, useState, useEffect } from 'react';
import Draggable, { type DraggableEventHandler } from 'react-draggable';
import { ITEM_DEFS, type PlacedItem } from '../types';

interface DraggableFurnitureProps {
    item: PlacedItem;
    isSelected: boolean;
    scale: number;
    onSelect: (multiSelect: boolean) => void;
    onUpdatePosition: (x: number, y: number) => void;
    onDrag?: (deltaX: number, deltaY: number) => void;
    onDragEnd?: () => void;
    onUpdateText?: (text: string) => void;
}

export const DraggableFurniture: React.FC<DraggableFurnitureProps> = ({
    item,
    isSelected,
    scale,
    onSelect,
    onUpdatePosition,
    onDrag,
    onDragEnd,
    onUpdateText
}) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const lastPosRef = useRef({ x: item.x, y: item.y });
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(item.text || '');

    // For furniture items, get def from constant. For text, define dummy def.
    const def = item.type === 'text'
        ? { width: 200, height: 40, color: 'transparent', shape: 'text', borderColor: 'transparent' }
        : ITEM_DEFS[item.type];

    // Sync prop text to local state
    useEffect(() => {
        if (item.text !== undefined) {
            setLocalText(item.text);
        }
    }, [item.text]);

    const handleDrag: DraggableEventHandler = (_e, data) => {
        if (onDrag && isSelected) {
            const deltaX = data.x - lastPosRef.current.x;
            const deltaY = data.y - lastPosRef.current.y;
            lastPosRef.current = { x: data.x, y: data.y };
            onDrag(deltaX, deltaY);
        }
    };

    const handleStop: DraggableEventHandler = (_e, data) => {
        onUpdatePosition(data.x, data.y);
        lastPosRef.current = { x: data.x, y: data.y };
        if (onDragEnd) {
            onDragEnd();
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.type === 'text') {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (onUpdateText) {
            onUpdateText(localText);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Stop multiline if we want single line, or remove this to allow
            handleBlur(); // Commit on Enter
        }
    };

    // If text type, width/height might be auto or larger
    const width = item.type === 'text' ? 'auto' : def.width;
    const height = item.type === 'text' ? 'auto' : def.height;

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: item.x, y: item.y }}
            onStart={(e) => {
                // Check for shift/meta key for multiselect
                const nativeEvent = e as MouseEvent;
                const isMulti = nativeEvent.shiftKey || nativeEvent.metaKey || nativeEvent.ctrlKey;
                // Only call onSelect if not already selected, or if it's a multi-select action
                // This prevents resetting the group selection when dragging a selected item
                if (!isSelected || isMulti) {
                    onSelect(isMulti);
                }
                lastPosRef.current = { x: item.x, y: item.y };
            }}
            onDrag={handleDrag}
            onStop={handleStop}
            disabled={isEditing} // Disable drag when editing text
            scale={scale} // Important for zooming
        >
            <div
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: width,
                    height: height,
                    minWidth: item.type === 'text' ? '150px' : undefined,
                    cursor: isEditing ? 'text' : 'move',
                    zIndex: isSelected || isEditing ? 100 : 1,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    // We handle selection in onStart, but for click-to-select without dragging:
                    // We need this if drag didn't occur. But React Draggable onStart fires on mousedown.
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onDoubleClick={handleDoubleClick}
            >
                {item.type === 'text' ? (
                    // Text Item Rendering
                    <div style={{
                        padding: '8px',
                        backgroundColor: isSelected || isEditing ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                        border: isSelected || isEditing ? '1px dashed #2563eb' : '1px solid transparent',
                        borderRadius: '4px',
                        transform: `rotate(${item.rotation}deg)`,
                        transition: 'background-color 0.2s, border-color 0.2s',
                    }}>
                        {isEditing ? (
                            <textarea
                                value={localText}
                                onChange={(e) => setLocalText(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                style={{
                                    width: '100%',
                                    minHeight: '1.2em',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'inherit',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    outline: 'none',
                                    resize: 'none',
                                    color: '#1f2937',
                                    overflow: 'hidden'
                                }}
                            />
                        ) : (
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#1f2937',
                                whiteSpace: 'pre-wrap',
                                pointerEvents: 'none' // Let clicks pass to parent
                            }}>
                                {localText || '雙擊編輯文字'}
                            </div>
                        )}
                    </div>
                ) : def.shape === 'triangle' ? (
                    // Triangle Rendering
                    <div style={{
                        width: '100%',
                        height: '100%',
                        transform: `rotate(${item.rotation}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: isSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                    }}>
                        <svg width="100%" height="100%" viewBox="0 0 24 24">
                            <polygon
                                points="12,2 22,22 2,22"
                                fill={def.color}
                                stroke={isSelected ? '#2563eb' : (def.borderColor || '#000')}
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                ) : (
                    // Furniture Rendering (rect/circle)
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: def.color,
                        border: `2px solid ${isSelected ? '#2563eb' : (def.borderColor || '#999')}`,
                        borderRadius: def.shape === 'circle' ? '50%' : '4px',
                        boxShadow: isSelected ? '0 0 0 4px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                        transform: `rotate(${item.rotation}deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {/* Orientation Indicator */}
                        {def.shape === 'rect' && (
                            <div style={{
                                position: 'absolute',
                                left: '10%',
                                width: '4px',
                                height: '60%',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: '2px'
                            }}></div>
                        )}
                    </div>
                )}
            </div>
        </Draggable>
    );
};
