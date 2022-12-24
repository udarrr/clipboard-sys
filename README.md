# clipboard-sys

![Tested](https://github.com/udarrr/clipboard-sys/workflows/Tests/badge.svg)
![Released](https://github.com/udarrr/clipboard-sys/workflows/Create%20tagged%20release/badge.svg)
![Supported node LTS versions](https://img.shields.io/badge/node@arch64-12%2C%2013%2C%2014%2C%2015%2C%2016%2C%2017%2C%2018%2C%2019-green)

> Access the system clipboard

- copy/paste text
- copy/paste image
- copy/paste files

Cross-platform!

Supports:

- Windows
- Linux (xclip supporting systems) *should be installed xclip (`sudo apt-get install xclip`)*
- MacOS

## Install

```nodejs
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
