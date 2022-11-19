import execa = require('execa');
import fs from 'fs-extra';
import pathLib from 'path';
import { SysClipboard } from '../..';

export default class DarwinClipboard implements SysClipboard {
  readFilesFrom(): Promise<Array<string>> {
    throw new Error('Method not implemented.');
  }

  pasteFilesFrom(action: 'Copy' | 'Cut', destinationFolder: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  copyFilesTo(...files: string[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async readTextFrom(): Promise<string> {
    const { stdout, stderr } = await execa('pbpaste', {
      stripFinalNewline: false,
    });

    if (!stdout) {
      throw new Error(`cannot read text error: ${stderr}`);
    }
    return stdout;
  }

  async writeTextTo(text: string): Promise<void> {
    const { stderr } = await execa('pbcopy', {
      input: text,
      env: {
        LC_CTYPE: 'UTF-8',
      },
    });

    if (stderr) {
      throw new Error(`cannot write text due to clipboard error: ${stderr}`);
    }
  }

  async readImageFrom(file?: string): Promise<Buffer> {
    const path = file ? file : `${pathLib.join(process.cwd(), 'temp.png')}`;
    await fs.writeFile(path, Buffer.from([]));

    const { stderr } = await execa(`osascript -e write (the clipboard as «class PNGf») to (open for access "${path}" with write permission)`);

    if (stderr) {
      throw new Error(`cannot read image from clipboard error: ${stderr}`);
    }
    try {
      const bufferFile = await fs.readFile(path);

      return bufferFile;
    } catch {
      return Buffer.from([]);
    } finally {
      try {
        if (fs.existsSync(path)) {
          await fs.unlink(path);
        }
      } catch {}
    }
  }

  async writeImageTo(file: string | Buffer): Promise<void> {
    const path = typeof file === 'string' ? file : await fs.writeFile(pathLib.join(process.cwd(), 'temp.png'), file);

    const { stderr } = execa(`osascript -e set the clipboard to (read "${path}" as TIFF picture)`);

    if (stderr) {
      throw new Error(`cannot write image to clipboard error: ${stderr}`);
    }
  }
}
