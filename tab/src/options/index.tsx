import React from 'react';
import ReactDOM from 'react-dom/client';
import { Options } from './Options';
import { initI18n } from '@/lib/i18n';
import './index.css';
import '../themes/index.css';

const root = document.getElementById('root');

if (root) {
  initI18n().then(() => {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Options />
      </React.StrictMode>
    );
  });
}
