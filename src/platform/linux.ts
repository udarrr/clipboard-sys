import execa = require('execa');
import fs from 'fs-extra';
import pathLib from 'path';
import { SysClipboard } from '../..';

export default class LinuxClipboard implements SysClipboard {
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
    const { stdout, stderr } = await execa('xclip  -selection clipboard -o | base64', {
      shell: true,
      stripFinalNewline: false,
    });

    if (stderr) {
      throw new Error(`cannot read text from clipboard error: ${stderr}`);
    }
    return Buffer.from(stdout, 'base64').toString();
  }

  async writeTextTo(text: string): Promise<void> {
    try {
      await execa(`echo -n '${text} | xclip -r -selection clipboard`, {
        stdin: 'inherit',
        shell: true,
      });
    } catch (error: any) {
      throw new Error(`cannot write text due to clipboard error: ${error.message}`);
    }
  }

  async readImageFrom(file?: string): Promise<Buffer> {
    const { stdout, stderr } = await execa('xclip -selection clipboard -t image/png -o | base64', { shell: true });

    if (stderr) {
      throw new Error(`cannot read image from clipboard error: ${stderr}`);
    }

    const buffer = Buffer.from(stdout, 'base64');

    if (typeof file === 'string') {
      await fs.writeFile(file, buffer);

      return buffer;
    } else {
      return buffer;
    }
  }

  async writeImageTo(file: string | Buffer): Promise<void> {
    const { stdout, stderr } = execa(`file -b --mime-type ${file}`, {
      shell: true,
    });

    if (stderr) {
      throw new Error(`cannot read file by path ${file}`);
    }
    let path = '';

    if (typeof file !== 'string') {
      const pathToTemp = pathLib.join(process.cwd(), 'temp.png');
      await fs.writeFile(pathToTemp, file);

      if (await fs.existsSync(pathToTemp)) {
        path = pathToTemp;
      } else {
        throw new Error("Temp file wasn't created");
      }
    } else {
      path = file;
    }

    try {
      await execa(`xclip -selection clipboard -t ${stdout} -i ${path}`, {
        stdio: 'inherit',
        shell: true,
      });
    } catch (error: any) {
      try {
        if (fs.existsSync(path)) {
          await fs.unlink(path);
        }
      } catch {}

      throw new Error(`cannot write image to clipboard error: ${error.message}`);
    } finally {
      try {
        if (fs.existsSync(path)) {
          await fs.unlink(path);
        }
      } catch {}
    }
  }
}

