import DarwinClipboard from './src/platform/darwin';
import LinuxClipboard from './src/platform/linux';
import WindowsClipboard from './src/platform/windows';

export interface SysClipboard {
  readTextFrom(): Promise<string>;
  writeTextTo: (text: string) => Promise<void>;
  readImageFrom(file?: string): Promise<Buffer>;
  writeImageTo(file: string | Buffer): Promise<void>;
  readFilesFrom(): Promise<Array<string>>;
  pasteFilesFrom(action: 'Copy' | 'Cut', destinationFolder: string): Promise<void>;
  copyFilesTo(...files: Array<string>): Promise<boolean>;
}

export const sysClipboard: SysClipboard = (() => {
  switch (process.platform) {
    case 'darwin':
      return new DarwinClipboard();
    case 'win32':
      return new WindowsClipboard();
    case 'linux':
      return new LinuxClipboard();
    default:
      throw new Error('unsupported os');
  }
})();
