import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BASE_SEGURA } from '../theme';

// Função "global" que o ToastContainer registra ao aparecer na tela.
// Qualquer tela chama toast('mensagem') sem precisar receber nada por props.
let addToastFn = null;

export function useToast() {
  return useCallback((msg) => {
    if (addToastFn) addToastFn(msg);
  }, []);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (msg) => {
      const id = Date.now() + Math.random();
      setToasts(t => [...t, { id, msg }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <View pointerEvents="none" style={estilos.container}>
      {toasts.map(t => (
        <View key={t.id} style={estilos.toast}>
          <Text style={estilos.texto}>{t.msg}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, bottom: 90 + BASE_SEGURA, gap: 8 },
  toast: { backgroundColor: '#0f172a', padding: 14, borderRadius: 12, opacity: 0.95 },
  texto: { color: '#fff', fontSize: 14 },
});
