import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import CompressTask from '@ilovepdf/ilovepdf-js-core/tasks/CompressTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('compress') as CompressTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ compression_level: 'extreme' });
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('<FILE_PATH>', data);
});