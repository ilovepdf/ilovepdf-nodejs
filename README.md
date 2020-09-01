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

### Using public URLs

```js
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';

const instance = new ILovePDFApi('<PUBLIC_KEY>', '<SECRET_KEY>');

// Public and secret key can be found in your developer panel
// at https://developer.ilovepdf.com/user/projects .
const task = instance.newTask('merge');

// Promise-based way to use ILovePDFApi.
task.start()
.then(() => {
    return task.upload('<FILE_URL>');
})
.then(() => {
    return task.upload('<FILE_URL>');
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

### Using ILovePDFFile class

```js
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';
import ILovePDFFile from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile';

const instance = new ILovePDFApi('<PUBLIC_KEY>', '<SECRET_KEY>');

const task = instance.newTask('merge');

task.start()
.then(() => {
    const file = new ILovePDFFile('<FILE_PATH>');

    return task.upload(file);
})
.then(() => {
    return task.upload('<FILE_URL>');
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

### Use sync calls

Thanks to be a promise-based API it is possible use the `await` JavaScript operator in order to call Task methods. Here you have an example:

```js
    let task = instance.newTask('merge');
    task = await task.start();
    task = await task.upload('<FILE_URL>');
    task = await task.upload('<FILE_URL>');
    task = await task.process();

    const data = await task.download();
```

## Documentation

Please see https://developer.ilovepdf.com/docs for up-to-date documentation.