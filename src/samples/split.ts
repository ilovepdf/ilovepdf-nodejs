import ILovePDFApi from "..";
import fs from 'fs';
import dotenv from 'dotenv';
import SplitTask from '@ilovepdf/ilovepdf-js-core/tasks/SplitTask';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('split') as SplitTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    // Be sure that your PDF has minimum 2 pages.
    return task.process({ split_mode: 'ranges', ranges: '1-2,1-2,1' });
})
.then(() => {
    return task.download();
})
.then((data) => {
    // Zip file.
    fs.writeFileSync('<FILE_PATH>', data);
});