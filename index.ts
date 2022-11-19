import DarwinClipboard from './src/platform/darwin';
import LinuxClipboard from './src/platform/linux';
import WindowsClipboard from './src/platform/windows';

export interface SysClipboard {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
  readImage(file?: string): Promise<Buffer>;
  writeImage(file: string | Buffer): Promise<void>;
  readFiles(): Promise<Array<string>>;
  pasteFiles(action: 'Copy' | 'Cut', destinationFolder: string, ...files: Array<string>): Promise<void>;
  writeFiles(...files: Array<string>): Promise<boolean>;
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
