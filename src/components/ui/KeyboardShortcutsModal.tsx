'use client';

import React, { useEffect } from 'react';
import { Modal } from './Modal';

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Listen to '?' key to open keyboard shortcuts modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '?' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        if (!isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcutGroups = [
    {
      title: 'Navigation & Canvas Tools',
      items: [
        { key: 'V', description: 'Selection Tool' },
        { key: 'H / Space', description: 'Pan Hand Tool' },
        { key: 'Wheel Scroll', description: 'Zoom In / Out' },
      ],
    },
    {
      title: 'Content Creation Tools',
      items: [
        { key: 'T', description: 'Add Text Block' },
        { key: 'S', description: 'Add Vector Shape' },
        { key: 'N', description: 'Add Sticky Note' },
        { key: 'I', description: 'Upload Image' },
      ],
    },
    {
      title: 'Canvas Editing Shortcuts',
      items: [
        { key: 'Double Click', description: 'Edit Text / Sticky Note' },
        { key: 'Delete / Backspace', description: 'Delete Selected Object' },
        { key: 'Esc', description: 'Deselect All Objects' },
        { key: 'Shift + Drag', description: 'Multi-Select Objects' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⌨️ Keyboard Shortcuts Guide" maxWidth="lg">
      <div className="flex flex-col gap-6 text-sm">
        {shortcutGroups.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
              {group.title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/30"
                >
                  <span className="text-xs text-on-surface font-medium">{item.description}</span>
                  <kbd className="px-2 py-1 rounded-md bg-white text-on-surface font-mono text-[11px] font-bold border border-outline-variant shadow-sm">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-outline-variant text-center text-xs text-on-surface-variant">
          Press <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-outline-variant text-on-surface font-mono shadow-sm">?</kbd> anytime to open this guide.
        </div>
      </div>
    </Modal>
  );
};
