import ILovePDFApi from "..";
import dotenv from 'dotenv';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('extract');

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    // Get an array with all the added files.
    // This array is ordered from older to newest.
    const file = task.getFiles()[0];
    // You get the object. This means that you can
    // set its properties directly.
    file.params.rotate = 90;
});