import execa = require('execa');
import fs from 'fs-extra';
import pathLib from 'path';
import { FilesActionEnum, FilesActionType, SysClipboard } from '../..';

export default class DarwinClipboard implements SysClipboard {
  async readFiles(): Promise<any> {
    const { stdout, stderr } = await execa(`osascript`, ['-ss', pathLib.join(__dirname, 'darwinScript', 'read_file.applescript')], { shell: true });

    if (stderr) {
      throw new Error(`cannot read image from clipboard error: ${stderr}`);
    }
    const files = stdout.split('\n');

    if (files.length) {
      const withoutQuotes = files.map((f) => f.replace('"', ''));
      const isPathExist = withoutQuotes.every((f) => {
        return fs.existsSync(f);
      });
      return isPathExist ? withoutQuotes : [];
    }
    return [];
  }

  async pasteFiles(action: FilesActionType, destinationFolder: string, ...files: Array<string>): Promise<void> {
    if (action === FilesActionEnum.Copy) {
      await this.writeFiles(...files);
      const { stdout, stderr } = await execa(`osascript`, ['-ss', pathLib.join(__dirname, 'darwinScript', 'paste_file.applescript'), destinationFolder]);

      if (stderr) {
        throw new Error(`cannot read image from clipboard error: ${stderr}`);
      }
    } else {
      await this.writeFiles(...files);
      const { stdout, stderr } = await execa(`osascript`, ['-ss', pathLib.join(__dirname, 'darwinScript', 'move_file.applescript'), destinationFolder]);

      if (stderr) {
        throw new Error(`cannot read image from clipboard error: ${stderr}`);
      }
    }
  }

  async writeFiles(...files: string[]): Promise<boolean> {
    const { stdout, stderr } = await execa(`osascript`, ['-ss', pathLib.join(__dirname, 'darwinScript', 'copy_file.applescript'), ...files]);

    if (stderr) {
      throw new Error(`cannot read image from clipboard error: ${stderr}`);
    }
    return !!stdout;
  }

  async readText(): Promise<string> {
    const { stdout, stderr } = await execa('pbpaste', {
      stripFinalNewline: false,
    });
    if (!stdout) {
      throw new Error(`cannot read text error: ${stderr}`);
    }
    return stdout;
  }

  async writeText(text: string): Promise<void> {
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

  async readImage(file?: string): Promise<Buffer> {
    let path = '';

    try {
      if (typeof file !== 'string') {
        path = pathLib.join(process.cwd(), 'temp.png');
        await fs.writeFile(path, Buffer.from([]));
      } else {
        path = file;
      }
      const { stderr } = await execa(`osascript`, ['-ss', pathLib.join(__dirname, 'darwinScript', 'read_image.applescript'), path]);

      if (stderr) {
        throw new Error(`cannot read image from clipboard error: ${stderr}`);
      }

      const bufferFile = await fs.readFile(path);

      return bufferFile;
    } catch (error: any) {
      throw new Error(error);
    } finally {
      if (!file) {
        try {
          if (fs.existsSync(path)) {
            await fs.unlink(path);
          }
        } catch {}
      }
    }
  }

  async writeImage(file: string | Buffer): Promise<void> {
    let path = '';

    try {
      if (typeof file !== 'string') {
        path = pathLib.join(process.cwd(), 'temp.png');
        await fs.writeFile(path, file);
      } else {
        path = file;
      }
      const { stderr } = await execa(`osascript`, ['-ss', pathLib.join(__dirname, 'darwinScript', 'write_image.applescript'), path]);

      if (stderr) {
        throw new Error(`cannot write image to clipboard error: ${JSON.stringify(stderr)}`);
      }
    } catch (error: any) {
      throw new Error(error);
    } finally {
      if (typeof file !== 'string') {
        try {
          if (fs.existsSync(path)) {
            await fs.unlink(path);
          }
        } catch {}
      }
    }
  }
}
