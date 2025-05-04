import type { ElectronAPI } from '@electron-toolkit/preload';
import type { WindowAPI } from '../types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: WindowAPI;
  }
}
