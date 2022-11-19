# sys-clipboard

> Access the system clipboard (copy/paste text, images, files)

Cross-platform!

Supports:

- Windows (text, images, files)
- Linux (text,images,files) *should be installed xclip (`sudo apt install xclip`)*
- MacOS (text, images),

## Install

```
npm install sys-clipboard
```

## Usage

```typescript
import { sysClipboard } from 'sys-clipboard';

async function readWriteText() {
  await sysClipboard.writeText('some text');
  console.log('text from clipboard:', await sysClipboard.readText());
}
readWriteText();

async function readWriteImage() {
  await sysClipboard.writeImage('./source.png');
  await sysClipboard.writeImage(fs.readFileSync('./source.png')); //buffer

  await sysClipboard.readImage('./destination.png');
  await sysClipboard.readImage(); //buffer
}
readWriteImage();

async function copyPasteFiles() {
  await sysClipboard.pasteFiles('Copy', './', './source1.png', './source2.png');
  await sysClipboard.pasteFiles('Cut', './', './source1.png', './source2.png');
}
copyPasteFiles();
```

## API
```typescript
export interface SysClipboard {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
  readImage(file?: string): Promise<Buffer>;
  writeImage(file: string | Buffer): Promise<void>;
  readFiles(): Promise<Array<string>>;
  pasteFiles(action: 'Copy' | 'Cut', destinationFolder: string, ...files: Array<string>): Promise<void>;
  writeFiles(...files: Array<string>): Promise<boolean>;
}
```

#### Contribution

Opened for contribution https://github.com/udarrr/sys-clipboard