import { ElectronAPI } from '@electron-toolkit/preload';
import type { CaptureOptions } from '../main/utils/capture';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      onWinResized: (callback: () => void) => () => void;
      captureDOM: (options: CaptureOptions) => Promise<string[]>;
      openDirectoryDialog: () => Promise<string>;
    };
  }
}
