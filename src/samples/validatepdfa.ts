import ILovePDFApi from "..";
import dotenv from 'dotenv';
import ValidatePdfaTask from '@ilovepdf/ilovepdf-js-core/tasks/ValidatePdfaTask';
import ILovePDFFile from '@ilovepdf/ilovepdf-js-core/utils/ILovePDFFile';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('validatepdfa') as ValidatePdfaTask;

task.start()
.then(() => {
    const file = new ILovePDFFile('<FILE_PATH>');
    return task.addFile(file);
})
.then(() => {
    return task.process({ conformance: 'pdfa-2a' });
})
.then(() => {
    // PDF Validation does not have any download. You must see
    // the server response directly.
    console.log(task.responses.process?.validations);
});