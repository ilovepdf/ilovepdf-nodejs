import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import PdfOcrTask from '@ilovepdf/ilovepdf-js-core/tasks/PdfOcrTask';
import ILovePDFFile from '../ILovePDFFile';


// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('pdfocr') as PdfOcrTask;

task.start()
    .then(() => {
        const file = new ILovePDFFile('<FILE_PATH>');
        return task.addFile(file);
    })
    .then(() => {
        return task.process({ ocr_languages: ['eng'] });
    })
    .then(() => {
        return task.download();
    })
    .then((data) => {
        fs.writeFileSync('<FILE_PATH>', data);
    });
