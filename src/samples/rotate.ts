import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import RotateTask from '@ilovepdf/ilovepdf-js-core/tasks/RotateTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('rotate') as RotateTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    const file = task.getFiles()[0];
    file.params.rotate = 90;

    return task.process();
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('<FILE_PATH>', data);
});