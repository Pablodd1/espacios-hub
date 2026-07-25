import { BrowserRouter, Route, Routes } from 'react-router';
import Layout from '@/components/Layout';
import { LanguageProvider } from '@/i18n';
import Home from '@/pages/Home';
import Tesoreria from '@/pages/Tesoreria';
import Cartera from '@/pages/Cartera';
import ComercioExterior from '@/pages/ComercioExterior';
import Comisiones from '@/pages/Comisiones';
import Contabilidad from '@/pages/Contabilidad';
import Logistica from '@/pages/Logistica';
import SyncCenter from '@/pages/SyncCenter';
import Configuracion from '@/pages/Configuracion';
import Login from '@/pages/Login';
import Importar from '@/pages/Importar';
import Perfil from '@/pages/Perfil';
import Admin from '@/pages/Admin';
import { AuthProvider } from '@/lib/auth';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tesoreria" element={<Tesoreria />} />
            <Route path="cartera" element={<Cartera />} />
            <Route path="comercio-exterior" element={<ComercioExterior />} />
            <Route path="comisiones" element={<Comisiones />} />
            <Route path="contabilidad" element={<Contabilidad />} />
            <Route path="logistica" element={<Logistica />} />
            <Route path="importar" element={<Importar />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="admin" element={<Admin />} />
            <Route path="sync-center" element={<SyncCenter />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
