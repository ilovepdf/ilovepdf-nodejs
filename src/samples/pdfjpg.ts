import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import PdfJpgTask from '@ilovepdf/ilovepdf-js-core/tasks/PdfJpgTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('pdfjpg') as PdfJpgTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ pdfjpg_mode: 'pages' });
})
.then(() => {
    return task.download();
})
.then((data) => {
    // Zip file.
    fs.writeFileSync('<FILE_PATH>', data);
});