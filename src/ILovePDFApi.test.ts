import dotenv from 'dotenv';
import ILovePDFApi from "./ILovePDFApi";
import Task from '@ilovepdf/ilovepdf-core/dist/tasks/Task';
import ILovePDFFile from '@ilovepdf/ilovepdf-core/dist/utils/ILovePDFFile';
import path from 'path';

// Load env vars.
dotenv.config();

const api = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ILovePDFApi', () => {

    it('gets a Task', () => {
        const task = api.newTask('merge');

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            // Force to get an Id due to architecture
            // can't be touched.
            const id = task.responses.start?.task!;
            return api.getTask(id);
        });
    });

    it('gets a list of Task', () => {
        const task = api.newTask('merge');

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            return api.listTasks();
        })
        .then(data => {
            // At this point, there is minimum one task.
            const task = data[0];
            expect(task).toBeInstanceOf(Task);
        });
    });

    describe('Api params', () => {

        it('process a task with file_key_encryption', async () => {
            const apiWithFileEncryption = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!, { file_encryption_key: '01234567890123' });

            const task = apiWithFileEncryption.newTask('compress');

            return task.start()
            .then(() => {
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            })
            .then(() => {
                return task.process();
            });
        });

    });

});