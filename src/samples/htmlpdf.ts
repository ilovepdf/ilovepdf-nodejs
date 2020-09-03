import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import HtmlPdfTask from '@ilovepdf/ilovepdf-js-core/tasks/HtmlPdfTask';
import ILovePDFFile from '@ilovepdf/ilovepdf-js-core/utils/ILovePDFFile';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('htmlpdf') as HtmlPdfTask;

task.start()
.then(() => {
    const file = new ILovePDFFile('<FILE_PATH>');
    return task.addFile(file);
})
.then(() => {
    return task.process({ single_page: true });
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('<FILE_PATH>', data);
});