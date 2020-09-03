import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import MergeTask from '@ilovepdf/ilovepdf-js-core/tasks/MergeTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('merge') as MergeTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process();
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('<FILE_PATH>', data);
});