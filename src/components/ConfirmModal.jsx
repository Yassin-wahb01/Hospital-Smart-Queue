import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Generic blocking confirmation / error modal.
 * Props:
 *   title       – dialog heading
 *   message     – body text
 *   detail      – optional secondary detail (ACTIVE_DEPENDENCIES_EXIST explanation)
 *   confirmLabel – label for the confirm button (default "Confirm")
 *   onConfirm   – called when confirm is clicked (omit to show info-only dialog)
 *   onClose     – called when Cancel / X is clicked
 *   danger      – if true, confirm button is red
 */
export default function ConfirmModal({
  title,
  message,
  detail,
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
  danger = false,
}) {
  const cancelRef = useRef(null);

  // Trap focus + ESC close
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-700">{message}</p>
        {detail && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{detail}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {onConfirm ? 'Cancel' : 'Close'}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
