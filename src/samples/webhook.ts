import ILovePDFApi from "..";
import dotenv from 'dotenv';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('merge');

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ webhook: '<WEBHOOK_URL>' });
});