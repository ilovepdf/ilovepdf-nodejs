import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import WatermarkTask from '@ilovepdf/ilovepdf-js-core/tasks/WatermarkTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('watermark') as WatermarkTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ mode: 'text', text: 'watermark text' });
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('<FILE_PATH>', data);
});