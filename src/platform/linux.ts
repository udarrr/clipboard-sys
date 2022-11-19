import execa = require('execa');
import fs from 'fs-extra';
import pathLib from 'path';
import { SysClipboard } from '../..';

export default class LinuxClipboard implements SysClipboard {
  readFiles(): Promise<Array<string>> {
    throw new Error('Method not implemented.');
  }

  async pasteFiles(action: 'Copy' | 'Cut', destinationFolder: string, ...files: Array<string>): Promise<void> {
    if(action === 'Copy'){
      await execa(`xclip-copyfile ${files.join(' ')}`, {
        stdio: 'inherit',
        shell: true,
      });
    } else {
      await execa(`xclip-cutfile ${files.join(' ')}`, {
        stdio: 'inherit',
        shell: true,
      });
    }
    await execa(`xclip-pastefile`, {
      shell: true,
      cwd: destinationFolder
    });
  }

  writeFiles(...files: string[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async readText(): Promise<string> {
    const { stdout, stderr } = await execa('xclip  -selection clipboard -o', {
      shell: true,
      stripFinalNewline: false,
    });

    if (stderr) {
      throw new Error(`cannot read text from clipboard error: ${stderr}`);
    }
    return stdout;
  }

  async writeText(text: string): Promise<void> {
    try {
      await execa.sync(`echo -n '${text}' | xclip -r -selection clipboard`, {
        stdin: 'inherit',
        shell: true,
        timeout: 1500,
      });
    } catch (error: any) {
      if(error.code !== 'ETIMEDOUT'){
        throw new Error(`cannot write text due to clipboard error: ${error.message}`);
      }
    }
  }

  async readImage(file?: string): Promise<Buffer> {
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

  async writeImage(file: string | Buffer): Promise<void> {
    let path = ''

    if (typeof file !== 'string') {
      const pathToTemp = pathLib.join(process.cwd(), 'temp.png');
      await fs.writeFile(pathToTemp, file);

      if (fs.existsSync(pathToTemp)) {
        path = pathToTemp;
      } else {
        throw new Error("Temp file wasn't created");
      }
    } else {
      path = file;
    }

    const { stdout, stderr } = await execa(`file -b --mime-type '${path}'`, {
      shell: true,
    });

    if (stderr) {
      throw new Error(`cannot read file by path ${file}`);
    };

    try {
      await execa(`xclip -selection clipboard -t ${stdout} -i ${path}`, {
        stdio: 'inherit',
        shell: true,
      });
    } catch (error: any) {
      throw new Error(`cannot write image to clipboard error: ${error.message}`);
    } 

    if(typeof file !== 'string'){
      try {
        if (fs.existsSync(path)) {
          await fs.unlink(path);
        }
      } catch {}
    }
  }
}

