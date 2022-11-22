import execa from 'execa';
import fs from 'fs-extra';
import pathLib from 'path';
import { SysClipboard } from '../..';

export default class WindowsClipboard implements SysClipboard {
  async readText(): Promise<string> {
    const { stdout, stderr } = await execa(
      `powershell -Command Add-Type -AssemblyName System.Windows.Forms; "if([Windows.Forms.Clipboard]::ContainsText()) {$clip=[Windows.Forms.Clipboard]::GetText(); if ($clip -ne $null) {return $clip }} "`,
      {
        stripFinalNewline: true,
      },
    );

    if (stderr) {
      throw new Error(`cannot read text from clipboard error: ${stderr}`);
    }
    return stdout;
  }

  async writeText(text: string): Promise<void> {
    const { stderr } = await execa('powershell -noprofile -command $input|Set-Clipboard', { input: text });

    if (stderr) {
      throw new Error(`cannot write text due to clipboard error: ${stderr}`);
    }
  }

  async readImage(file?: string): Promise<Buffer> {
    const { stdout, stderr } = await execa(
      `powershell -Command Add-Type -AssemblyName System.Windows.Forms; "$clip=[Windows.Forms.Clipboard]::GetImage();if ($clip -ne $null) { $converter = New-Object -TypeName System.Drawing.ImageConverter;$byte_vec = $converter.ConvertTo($clip, [byte[]]); $EncodedText =[Convert]::ToBase64String($byte_vec); return $EncodedText }"`,
    );

    if (stderr) {
      throw new Error(`cannot read image from clipboard error: ${stderr}`);
    }
    let imageBuffer = Buffer.from(stdout, 'base64');

    if (file) {
      await fs.writeFile(file, imageBuffer);

      return imageBuffer;
    } else {
      return imageBuffer;
    }
  }

  async writeImage(file: string | Buffer): Promise<void> {
    let path = '';

    if (typeof file !== 'string') {
      const pathToTemp = pathLib.join(process.cwd(), 'temp.png');
      await fs.writeFile(pathToTemp, file);

      if (await fs.existsSync(pathToTemp)) {
        path = pathToTemp;
      }
    } else {
      path = file;
    }

    const { stderr } = await execa(`powershell -Command Add-Type -AssemblyName System.Windows.Forms; "[Windows.Forms.Clipboard]::SetImage([System.Drawing.Image]::FromFile('${path}'));"`);

    if (typeof file !== 'string') {
      try {
        if (fs.existsSync(path)) {
          await fs.unlink(path);
        }
      } catch {}
    }

    if (stderr) {
      throw new Error(`cannot write image to clipboard error: ${stderr}`);
    }
  }

  async readFiles() {
    const { stdout, stderr } = await execa(
      `powershell -Command Add-Type -AssemblyName System.Windows.Forms; "if ([Windows.Forms.Clipboard]::ContainsFileDropList()) {$files = [Windows.Forms.Clipboard]::GetFileDropList(); return $files"}`,
      {
        stripFinalNewline: true,
      },
    );

    if (stderr) {
      throw new Error(`cannot read files from clipboard error: ${stderr}`);
    }

    if (stdout) {
      const filePaths = stdout.split(/\r\n/g);
      filePaths.length && filePaths[filePaths.length - 1] === '' ? filePaths.pop() : filePaths;

      return filePaths;
    } else {
      return [];
    }
  }

  async pasteFiles(action: 'Copy' | 'Cut', destinationFolder: string, ...files: Array<string>): Promise<void> {
    if(files && files.length){
      await this.writeFiles(...files);
    }
    const { stderr } = await execa(
      `powershell -Command Add-Type -AssemblyName System.Windows.Forms; "$fileDrop = get-clipboard -Format FileDropList; if($fileDrop -eq $null) { write-host 'No files on the clipboard'; return } foreach($file in $fileDrop) {if (Test-Path $file) {if($file.Mode.StartsWith('d')) { $source = join-path $file.Directory $file.Name; Invoke-Expression '${
        action === 'Copy' ? 'copy' : 'move'
      }-item -Recurse $source $($file.Name)'} else {$file.Name; $file | ${action === 'Copy' ? 'copy' : 'move'}-item -Destination "${destinationFolder}"}}}"`,
      {
        stripFinalNewline: false,
      },
    );

    if (stderr) {
      throw new Error(`cannot read files from clipboard error: ${stderr}`);
    }
  }

  async writeFiles(...files: Array<string>): Promise<boolean> {
    const formattedFiles: Array<string> = [];

    files.forEach((f) => {
      formattedFiles.push(`('${f}')`);
    });
    const { stdout, stderr } = await execa(
      `powershell -Command Add-Type -AssemblyName System.Windows.Forms; "$files = [System.Collections.Specialized.StringCollection]::new(); $files.AddRange(@(${formattedFiles.join(
        ',',
      )})); [Windows.Forms.Clipboard]::SetFileDropList($files);`,
      {
        stripFinalNewline: false,
      },
    );

    if (stderr) {
      throw new Error(`cannot read files from clipboard error: ${stderr}`);
    }
    return +stdout === 0;
  }
}
