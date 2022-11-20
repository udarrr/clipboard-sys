import { expect } from 'chai';
import { clipboard } from '../index';
import path from 'path';
import sizeOf from 'buffer-image-size';
import sizeOfImage from 'image-size';
import fs from 'fs-extra';

describe('Read text from clipboard', () => {
  const testText = 'test text';

  before(async () => {
    const pathToTestFile = path.join(process.cwd(), 'tests', 'data', 'from', 'testFile.txt');

    if (!fs.existsSync(pathToTestFile)) {
      await fs.writeFile(pathToTestFile, Buffer.from('test'));
    }
  });

  after(async () => {});

  it('Write read text clipboard', async () => {
    await clipboard.writeText(testText);
    const text = await clipboard.readText();

    expect(text).to.be.equal(testText);
  });

  it('Write read to file image clipboard', async () => {
    const pathToTestPic = path.join(process.cwd(), 'tests', 'data', 'tempPic.png');
    const pathToReadPic = path.join(process.cwd(), 'tests', 'data', 'readPic.png');
    const sizeTestPic = sizeOfImage(pathToTestPic);

    await clipboard.writeImage(pathToTestPic);
    await clipboard.readImage(pathToReadPic);

    const sizeReadPic = sizeOfImage(pathToReadPic);

    try {
      if (fs.existsSync(pathToReadPic)) {
        await fs.unlink(pathToReadPic);
      }
    } catch {}

    expect(JSON.stringify(sizeTestPic)).to.be.equal(JSON.stringify(sizeReadPic));
  });

  it('Write read to buffer image clipboard', async () => {
    const pathToTestPic = path.join(process.cwd(), 'tests', 'data', 'tempPic.png');
    const pathToReadPic = path.join(process.cwd(), 'tests', 'data', 'readPic.png');

    const bufferTempPic = await fs.readFile(pathToTestPic);
    const sizeTestPic = sizeOf(bufferTempPic);

    await clipboard.writeImage(bufferTempPic);
    const bufferReadPic = await clipboard.readImage();

    const sizeReadPic = sizeOf(bufferReadPic);

    try {
      if (fs.existsSync(pathToReadPic)) {
        await fs.unlink(pathToReadPic);
      }
    } catch {}

    expect(JSON.stringify(sizeTestPic)).to.be.equal(JSON.stringify(sizeReadPic));
  });

  if(process.platform === 'win32') {
    it('Read files clipboard', async () => {
      const pathToTestFile = path.join(process.cwd(), 'tests', 'data', 'from', 'testFile.txt');
  
      await clipboard.writeFiles(pathToTestFile, pathToTestFile, pathToTestFile);
      const files = await clipboard.readFiles();
  
      expect(files.every((f) => fs.existsSync(f))).to.be.equal(true);
    });
  }


  it('Copy paste files clipboard', async () => {
    const pathToTestFile = path.join(process.cwd(), 'tests', 'data', 'from', 'testFile.txt');
    const destinationFolder = path.join(process.cwd(), 'tests', 'data', 'to');
    const pathToCopiedFile = path.join(destinationFolder, 'testFile.txt');

    if(process.platform === 'win32'){
      await clipboard.writeFiles(pathToTestFile);
    }
    await clipboard.pasteFiles('Copy', destinationFolder, pathToTestFile);
    const isExist = fs.existsSync(pathToCopiedFile);

    try {
      if (fs.existsSync(pathToCopiedFile)) {
        await fs.unlink(pathToCopiedFile);
      }
    } catch {}

    expect(isExist).to.be.equal(true);
  });

  it('Cut paste files clipboard', async () => {
    const pathToTestFile = path.join(process.cwd(), 'tests', 'data', 'from', 'testFile.txt');
    const destinationFolder = path.join(process.cwd(), 'tests', 'data', 'to');
    const pathToCopiedFile = path.join(destinationFolder, 'testFile.txt');

    if(process.platform === 'win32'){
      await clipboard.writeFiles(pathToTestFile);
    }
    await clipboard.pasteFiles('Cut', destinationFolder, pathToTestFile);

    const isExistTemp = fs.existsSync(pathToTestFile);
    const isExistDestination = fs.existsSync(pathToCopiedFile);

    try {
      if (fs.existsSync(pathToCopiedFile)) {
        await fs.unlink(pathToCopiedFile);
      }
    } catch {}

    if (!isExistTemp) {
      await fs.writeFile(pathToTestFile, Buffer.from('test'));
    }

    expect(isExistTemp).to.be.equal(false);
    expect(isExistDestination).to.be.equal(true);
  });
});
