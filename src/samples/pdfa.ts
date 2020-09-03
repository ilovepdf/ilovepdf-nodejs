import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import PdfaTask from '@ilovepdf/ilovepdf-js-core/tasks/PdfaTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('pdfa') as PdfaTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ allow_downgrade: false });
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('<FILE_PATH>', data);
});