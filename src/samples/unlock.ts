import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import UnlockTask from '@ilovepdf/ilovepdf-js-core/tasks/UnlockTask';
import ILovePDFFile from '@ilovepdf/ilovepdf-js-core/utils/ILovePDFFile';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('unlock') as UnlockTask;

task.start()
.then(() => {
    const file = new ILovePDFFile('<FILE_PATH>');
    return task.addFile(file);
})
.then(() => {
    const file = task.getFiles()[0];
    file.params.password = 'test';

    return task.process();
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('<FILE_PATH>', data);
});