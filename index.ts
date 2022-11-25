import DarwinClipboard from './src/platform/darwin';
import LinuxClipboard from './src/platform/linux';
import WindowsClipboard from './src/platform/windows';

export enum FilesActionEnum {
  Copy = 'Copy',
  Cut = 'Cut',
}
export type FilesActionType = `${FilesActionEnum}`;
export interface SysClipboard {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
  readImage(file?: string): Promise<Buffer>;
  writeImage(file: string | Buffer): Promise<void>;
  readFiles(): Promise<Array<string>>;
  pasteFiles(action: FilesActionType, destinationFolder: string, ...files: Array<string>): Promise<void>;
  writeFiles(...files: Array<string>): Promise<boolean>;
}

export const clipboard: SysClipboard = (() => {
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
