import React, { useState, useRef } from 'react';
import { ITEM_DEFS, type ItemDef, type ItemType, type SavedLayout } from '../types';
import { Plus, Type as TypeIcon, Save, FolderOpen, Download, Upload, Trash2, Check } from 'lucide-react';

interface SidebarProps {
    counts: Record<ItemType, number>;
    onAdd: (type: ItemType) => void;
    savedLayouts: SavedLayout[];
    currentLayoutName: string;
    onSaveLayout: (name: string) => void;
    onLoadLayout: (id: string) => void;
    onDeleteLayout: (id: string) => void;
    onExportJSON: () => void;
    onImportJSON: (file: File) => void;
    onClearAll: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    counts,
    onAdd,
    savedLayouts,
    currentLayoutName,
    onSaveLayout,
    onLoadLayout,
    onDeleteLayout,
    onExportJSON,
    onImportJSON,
    onClearAll
}) => {
    const [newLayoutName, setNewLayoutName] = useState('');
    const [showSaveInput, setShowSaveInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (newLayoutName.trim()) {
            onSaveLayout(newLayoutName.trim());
            setNewLayoutName('');
            setShowSaveInput(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImportJSON(file);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div style={{
            width: '300px',
            height: '100vh',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'var(--backdrop-blur)',
            borderRight: 'var(--glass-border)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10
        }}>
            <h1 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                Space M 座位安排
            </h1>

            {/* 儲存管理區 */}
            <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: 'var(--color-text)' }}>
                    配置管理
                </div>

                {/* 當前配置名稱 */}
                {currentLayoutName && (
                    <div style={{
                        fontSize: '12px',
                        color: '#059669',
                        backgroundColor: '#d1fae5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Check size={12} />
                        目前：{currentLayoutName}
                    </div>
                )}

                {/* 儲存新配置 */}
                {showSaveInput ? (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        <input
                            type="text"
                            value={newLayoutName}
                            onChange={(e) => setNewLayoutName(e.target.value)}
                            placeholder="輸入配置名稱..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            autoFocus
                            style={{
                                flex: 1,
                                padding: '6px 10px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '6px 10px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}
                        >
                            確定
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        <button
                            onClick={() => setShowSaveInput(true)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                            }}
                        >
                            <Save size={14} />
                            儲存配置
                        </button>
                        <button
                            onClick={onClearAll}
                            title="清空畫布"
                            style={{
                                padding: '8px',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}

                {/* 匯出/匯入 */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <button
                        onClick={onExportJSON}
                        style={{
                            flex: 1,
                            padding: '6px',
                            backgroundColor: 'var(--color-surface-hover)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        <Download size={12} />
                        匯出
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            flex: 1,
                            padding: '6px',
                            backgroundColor: 'var(--color-surface-hover)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        <Upload size={12} />
                        匯入
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* 已儲存的配置列表 */}
                {savedLayouts.length > 0 && (
                    <div style={{
                        maxHeight: '120px',
                        overflowY: 'auto',
                        borderTop: '1px solid var(--color-border)',
                        paddingTop: '8px',
                        marginTop: '4px',
                    }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                            已儲存的配置：
                        </div>
                        {savedLayouts.map(layout => (
                            <div
                                key={layout.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 8px',
                                    backgroundColor: 'var(--color-surface-hover)',
                                    borderRadius: '6px',
                                    marginBottom: '4px',
                                    fontSize: '12px',
                                }}
                            >
                                <FolderOpen size={12} style={{ color: '#6b7280' }} />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {layout.name}
                                </span>
                                <button
                                    onClick={() => onLoadLayout(layout.id)}
                                    style={{
                                        padding: '3px 8px',
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                    }}
                                >
                                    載入
                                </button>
                                <button
                                    onClick={() => onDeleteLayout(layout.id)}
                                    style={{
                                        padding: '3px 6px',
                                        backgroundColor: 'transparent',
                                        color: '#991b1b',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
                {/* Text Tool */}
                <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>文字註解</span>
                    </div>
                    <button
                        onClick={() => onAdd('text')}
                        style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: 'var(--color-text)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}
                    >
                        <TypeIcon size={14} />
                        加入文字
                    </button>
                </div>

                {Object.values(ITEM_DEFS).map((def: ItemDef) => {
                    const used = counts[def.type] || 0;
                    const remaining = def.maxCount - used;
                    const isExhausted = remaining <= 0;

                    return (
                        <div key={def.type} style={{
                            padding: '12px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: isExhausted ? 0.6 : 1,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{def.name}</span>
                                <span style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    backgroundColor: isExhausted ? '#fee2e2' : '#d1fae5',
                                    color: isExhausted ? '#991b1b' : '#065f46'
                                }}>
                                    {used} / {def.maxCount}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', height: '40px', alignItems: 'center' }}>
                                {/* Preview Icon */}
                                {def.shape === 'triangle' ? (
                                    <svg width="28" height="28" viewBox="0 0 24 24">
                                        <polygon
                                            points="12,2 22,22 2,22"
                                            fill={def.color}
                                            stroke={def.borderColor || '#000'}
                                            strokeWidth="2"
                                        />
                                    </svg>
                                ) : (
                                    <div style={{
                                        width: def.shape === 'rect' ? '50px' : '28px',
                                        height: def.shape === 'rect' ? '18px' : '28px',
                                        backgroundColor: def.color,
                                        border: `2px solid ${def.borderColor || '#ccc'}`,
                                        borderRadius: def.shape === 'circle' ? '50%' : '4px'
                                    }} />
                                )}
                            </div>

                            <button
                                onClick={() => !isExhausted && onAdd(def.type)}
                                disabled={isExhausted}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: isExhausted ? '#9ca3af' : 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontWeight: 500,
                                    cursor: isExhausted ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                <Plus size={14} />
                                加入配置
                            </button>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '11px', color: '#6b7280' }}>
                <p>拖曳空白處框選多個物件</p>
                <p>R 旋轉 | Del 刪除 | Ctrl+D 複製</p>
            </div>
        </div>
    );
};
