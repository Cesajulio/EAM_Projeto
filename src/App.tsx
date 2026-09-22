import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Equipamentos from './pages/Equipamentos';
import Cautelas from './pages/Cautelas';
import Manutencoes from './pages/Manutencoes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="equipamentos" element={<Equipamentos />} />
          <Route path="cautelas" element={<Cautelas />} />
          <Route path="manutencoes" element={<Manutencoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
