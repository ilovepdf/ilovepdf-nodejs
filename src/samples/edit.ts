import EditTask from '@ilovepdf/ilovepdf-js-core/tasks/edit/EditTask';
import Text from "@ilovepdf/ilovepdf-js-core/tasks/edit/Text";
import ILovePDFFile from "../ILovePDFFile";
import dotenv from 'dotenv';
import fs from 'fs';
import ILovePDFApi from "..";

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('editpdf') as EditTask;

task.start()
.then(() => {
    const file = new ILovePDFFile('<FILE_PATH>');
    return task.addFile(file);
})
.then(() => {
    const textElement = new Text({
        coordinates: { x: 100, y: 100 },
        dimensions: { w: 100, h: 100 },
        text: 'test',
    });
    return task.addElement(textElement);
})
.then(() => {
    return task.process();
})
.then(() => {
    return task.download();
})
.then((data) => {
    fs.writeFileSync('path/to/local/file_name.txt', data);
});