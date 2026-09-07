import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => (
  <div className="app-layout">
    <main>
      <Outlet />
    </main>
    <BottomNav />
  </div>
);

export default Layout;
