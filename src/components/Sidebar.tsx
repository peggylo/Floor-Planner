import React from 'react';
import { ITEM_DEFS, type ItemDef, type ItemType } from '../types';
import { Plus, Type as TypeIcon } from 'lucide-react';

interface SidebarProps {
    counts: Record<ItemType, number>;
    onAdd: (type: ItemType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ counts, onAdd }) => {
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
            <h1 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 'bold' }}>
                Space M 座位安排
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                {/* Text Tool */}
                <div style={{
                    padding: '16px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>文字註解</span>
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
                            cursor: 'pointer'
                        }}
                    >
                        <TypeIcon size={16} />
                        加入文字
                    </button>
                </div>

                {Object.values(ITEM_DEFS).map((def: ItemDef) => {
                    const used = counts[def.type] || 0;
                    const remaining = def.maxCount - used;
                    const isExhausted = remaining <= 0;

                    return (
                        <div key={def.type} style={{
                            padding: '16px',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: isExhausted ? 0.6 : 1,
                            transition: 'transform 0.2s',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600 }}>{def.name}</span>
                                <span style={{
                                    fontSize: '12px',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    backgroundColor: isExhausted ? '#fee2e2' : '#d1fae5',
                                    color: isExhausted ? '#991b1b' : '#065f46'
                                }}>
                                    {used} / {def.maxCount}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0', height: '50px', alignItems: 'center' }}>
                                {/* Preview Icon */}
                                {def.shape === 'triangle' ? (
                                    <svg width="30" height="30" viewBox="0 0 24 24">
                                        <polygon
                                            points="12,2 22,22 2,22"
                                            fill={def.color}
                                            stroke={def.borderColor || '#000'}
                                            strokeWidth="2"
                                        />
                                    </svg>
                                ) : (
                                    <div style={{
                                        width: def.shape === 'rect' ? '60px' : '30px',
                                        height: def.shape === 'rect' ? '20px' : '30px',
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
                                    cursor: isExhausted ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <Plus size={16} />
                                加入配置
                            </button>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '12px', color: '#6b7280' }}>
                <p>點擊按鈕將物件加入畫面中央。</p>
                <p>在畫面上拖曳調整位置。</p>
                <p>點擊物件選取，按 R 旋轉，Del 刪除。</p>
                <p>雙擊文字以編輯內容。</p>
            </div>
        </div>
    );
};
