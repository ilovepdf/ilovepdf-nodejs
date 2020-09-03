import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import ExtractTask from '@ilovepdf/ilovepdf-js-core/tasks/ExtractTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('extract') as ExtractTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ detailed: true });
})
.then(() => {
    return task.download();
})
.then((data) => {
    // Plain text.
    fs.writeFileSync('<FILE_PATH>', data);
});