import React from 'react';
import ReactDOM from 'react-dom/client';
import { NewTab } from './NewTab';
import { initI18n } from '@/lib/i18n';
import './index.css';

const root = document.getElementById('root');

if (root) {
  // 初始化 i18n 后再渲染
  initI18n().then(() => {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <NewTab />
      </React.StrictMode>
    );
  });
}
