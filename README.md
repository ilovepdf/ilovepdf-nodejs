iLovePDF Api - NodeJS Library
--------------------------

NodeJS library for [iLovePDF Api](https://developer.ilovepdf.com)

You can sign up for a iLovePDF account at https://developer.ilovepdf.com .

Develop and automate PDF processing tasks like Compress PDF, Merge PDF, Split PDF, convert Office to PDF, PDF to JPG, Images to PDF, add Page Numbers, Rotate PDF, Unlock PDF, stamp a Watermark and Repair PDF. Each one with several settings to get your desired results.

## Requirements

Requirements to use this library are:

1. NPM - Package built with version @6.14.5 .
2. NodeJS - Package built with version @12.18.2 .

You cand download them [here](https://nodejs.org/en).

## Install

You can install the library via [NPM](https://www.npmjs.com). Run the following command:

```bash
npm install @ilovepdf/ilovepdf-nodejs
```

## Getting Started

Simple usage looks like:

```js
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';

const instance = new ILovePDFApi('<PUBLIC_KEY>', '<PRIVATE_KEY>');

// We want to merge two PDFs.
const task = instance.newTask('merge');

// Async calls using promises.
// Also, it can be used the 'await' keyword:
// const startResult = await task.start();
task.start()
.then(() => {
    return task.upload('<PDF_URL1>');
})
.then(() => {
    return task.upload('<PDF_URL2>');
})
.then(() => {
    return task.process();
})
.then(() => {
    return task.download();
})
.then((data) => {
    console.log('DONE');
});
```

## Documentation

Please see https://developer.ilovepdf.com/docs for up-to-date documentation.

<!-- TALK WITH MARCO OR ALEIX -->
<!-- ## License
The code is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT). -->