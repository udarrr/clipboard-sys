# clipboard-sys

> Access the system clipboard

- copy/paste text
- copy/paste image
- copy/paste files

Cross-platform!

Supports:

- Windows
- Linux (xclip supporting systems) *should be installed xclip (`sudo apt install xclip`)*
- MacOS (text, images)

## Install

```
npm install clipboard-sys
```

## Usage

```typescript
import { clipboard } from './index';
import fs from 'fs';

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

async function copyFiles() {
  await clipboard.writeFiles('./source1.txt', './source2.png');
  console.log(await clipboard.readFiles());
}
copyFiles();

async function pasteFiles() {
  await clipboard.pasteFiles('Copy', './destinationFolder', './source1.png', './source2.png');
  await clipboard.pasteFiles('Cut', './destinationFolder', './source1.png', './source2.png');
}
pasteFiles();
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

Opened for contribution <https://github.com/udarrr/clipboard-sys>
