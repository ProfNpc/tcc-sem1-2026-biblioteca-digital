import { useState, useCallback } from 'react';

let addToastFn = null;

export function useToast() {
  const toast = useCallback((msg) => {
    if (addToastFn) addToastFn(msg);
  }, []);
  return toast;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  addToastFn = (msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  );
}
