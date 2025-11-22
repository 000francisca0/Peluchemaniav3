// src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

// ✅ Import YOUR original header and footer
import Header from '../header';
import Footer from '../footer';

export default function MainLayout() {
  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
