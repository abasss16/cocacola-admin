import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface DeleteConfirmationProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteConfirmation({
  product,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmationProps) {
  return (
    <AnimatePresence>
      {isOpen && product && (
        <div id="delete-confirmation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Overlay mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/35 backdrop-blur-xs"
            id="delete-mask"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden border border-gray-100 z-50"
            id="delete-dialog-box"
          >
            <div className="flex gap-4 items-start font-sans">
              <div id="delete-warning-badge" className="w-10 h-10 rounded-full bg-red-50 text-[#E60028] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  Discharge Product?
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Are you absolutely sure you want to delete <strong className="text-gray-800">"{product.name}"</strong>? This will permanently remove the record from your e-commerce repository. This action cannot be reversed.
                </p>

                {/* Micro product preview card */}
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-white overflow-hidden flex items-center justify-center border border-gray-100 p-1">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&q=80&w=200'}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-700 truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Rp {product.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions header/footer */}
            <div className="mt-6 flex items-center justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 active:scale-95 text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                id="delete-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#E60028] hover:bg-[#c50022] active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-900/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                id="delete-btn-confirm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
