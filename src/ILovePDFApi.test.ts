import dotenv from 'dotenv';
import ILovePDFApi from "./ILovePDFApi";
import Task from '@ilovepdf/ilovepdf-js-core/tasks/Task';
import ILovePDFFile from '@ilovepdf/ilovepdf-js-core/utils/ILovePDFFile';
import path from 'path';
import SignTask from '@ilovepdf/ilovepdf-js-core/tasks/sign/SignTask';
import SignatureFile from '@ilovepdf/ilovepdf-js-core/tasks/sign/elements/SignatureFile';
import Signer from '@ilovepdf/ilovepdf-js-core/tasks/sign/receivers/Signer';

// Load env vars.
dotenv.config();

const api = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ILovePDFApi', () => {

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

    it('process a task', async () => {
        const task = api.newTask('merge');

        await task.start()

        const file1 = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
        await task.addFile(file1);

        const file2 = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
        await task.addFile(file2);

        await task.process();

        const data = await task.download();

        expect(data.length).toBeGreaterThan(0);
    });

    it('process a signature task', async () => {
        const task = api.newTask('sign') as SignTask;

        await task.start();

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Signer.
        const signatureFile = new SignatureFile(file, [{
            type: 'signature',
            position: '300 -100',
            pages: '1',
            size: 28,
            color: '#000000',
            font: null as unknown as string,
            content: null as unknown as string
        }]);

        const signer = new Signer('Diego Signer', 'invent@ado.com');
        signer.addFile(signatureFile);
        task.addReceiver(signer);

        const response = await task.process({
            mode: 'multiple',
        });

        expect(response.signers[0].name).toBe('Diego Signer');
    });

    describe('Api params', () => {

        it('process a task with file_key_encryption', async () => {
            const apiWithFileEncryption = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!, { file_encryption_key: '0123456789012345' });

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