import ILovePDFApi from "..";
import SplitTask from '@ilovepdf/ilovepdf-js-core/tasks/SplitTask';
import fs from 'fs';
import dotenv from 'dotenv';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('split') as SplitTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ split_mode: 'ranges', ranges: '1' });
})
.then(() => {
    return task.connect('pdfjpg');
})
.then(pdfjpgTask => {
    return pdfjpgTask.process();
})
.then(pdfjpgTask => {
    return pdfjpgTask.download();
})
.then(data => {
    // JPG file.
    fs.writeFileSync('<FILE_PATH>', data);
});