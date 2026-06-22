import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div id="toast-container" className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-xl"
              id={`toast-${toast.id}`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertTriangle className="w-5 h-5 text-[#E60028]" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-gray-500" />}
              </div>
              
              <div className="flex-1 text-sm font-sans font-medium text-gray-800">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded hover:bg-gray-50"
                aria-label="Close notification"
                id={`toast-close-${toast.id}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
