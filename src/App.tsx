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

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tesoreria" element={<Tesoreria />} />
            <Route path="cartera" element={<Cartera />} />
            <Route path="comercio-exterior" element={<ComercioExterior />} />
            <Route path="comisiones" element={<Comisiones />} />
            <Route path="contabilidad" element={<Contabilidad />} />
            <Route path="logistica" element={<Logistica />} />
            <Route path="sync-center" element={<SyncCenter />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}
