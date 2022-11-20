# clipboard-sys

> Access the system clipboard (copy/paste text, images, files)

Cross-platform!

Supports:

- Windows (text, images, files)
- Linux (text,images,files) *should be installed xclip (`sudo apt install xclip`)*
- MacOS (text, images),

## Install

```
npm install clipboard-sys
```

## Usage

```typescript
import { clipboard } from 'clipboard-sys';
import fs from 'fs'

async function readWriteText() {
  await clipboard.writeText('some text');
  console.log('text from clipboard:', await clipboard.readText());
}
readWriteText();

async function readWriteImage() {
  await clipboard.writeImage('./source.png');
  await clipboard.readImage('./destination.png');

  await clipboard.writeImage(fs.readFileSync('./source.png')); //buffer
  return await clipboard.readImage(); //buffer
}
readWriteImage();

async function copyPasteFiles() {
  await clipboard.pasteFiles('Copy', './', './source1.png', './source2.png');
  await clipboard.pasteFiles('Cut', './', './source1.png', './source2.png');
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

Opened for contribution https://github.com/udarrr/clipboard-sys