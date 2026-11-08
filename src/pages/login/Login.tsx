import { useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useLoginPanel, type FasePanel } from '../main/footer/loginPanelContext';
import Inicio from '../inicio/Inicio';

// /login y /registro muestran la portada con el panel de inicio de sesión abierto en la fase correspondiente
// (el panel vive en el pie). Así «ir al login» sigue siendo una URL válida, p. ej. al abrir una ruta privada sin sesión.
export default function Login({ fase }: { fase: FasePanel }) {
  const { abrir } = useLoginPanel();
  useDocumentTitle(fase === 'registro' ? 'Crear cuenta' : 'Iniciar sesión');
  useEffect(() => abrir(fase), [abrir, fase]);
  return <Inicio />;
}
