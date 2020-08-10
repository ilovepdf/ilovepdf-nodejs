import ILovePDFApi from "./ILovePDFApi";
import ILovePDFFile from "./ILovePDFFile";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars.
dotenv.config();

const api = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ILovePDFApi', () => {

    describe('Task', () => {

        it('starts a task', () => {
            const task = api.newTask('merge');

            return task.start()
            .then((sameTask) => {

                expect(sameTask === task).toBeTruthy();
            });
        });

        it('adds a file from URL', () => {
            const task = api.newTask('merge');

            return task.start()
            .then(() => {
                return task.addFile('http://africau.edu/images/default/sample.pdf');
            });
        },
        // Due to server has to download the file it can take more than 5s default jest timeout.
        // Due to this, timeout is increased.
        10000);

        it('adds a file from ILovePDFFile', () => {
            const task = api.newTask('merge');

            return task.start()
            .then(() => {
                const file = new ILovePDFFile('../tests/input/sample.pdf');
                return task.addFile(file);
            });
        });

        it('process a merge', () => {
            const task = api.newTask('merge');

            return task.start()
            .then(() => {
                const file = new ILovePDFFile('../tests/input/sample.pdf');
                return task.addFile(file);
            })
            .then(() => {
                const file = new ILovePDFFile('../tests/input/sample.pdf');
                return task.addFile(file);
            })
            .then(() => {
                return task.process();
            });
        });

        it('downloads a pdf', () => {
            const task = api.newTask('merge');

            return task.start()
            .then(() => {
                const file = new ILovePDFFile('../tests/input/sample.pdf');
                return task.addFile(file);
            })
            .then(() => {
                const file = new ILovePDFFile('../tests/input/sample.pdf');
                return task.addFile(file);
            })
            .then(() => {
                return task.process();
            })
            .then(() => {
                return task.download();
            })
            .then(data => {
                const pdf = fs.readFileSync(path.resolve(__dirname, '../tests/output/merge.pdf'));

                const dataWithoutMeta = removePDFUniqueMetadata(data);
                const pdfWithoutMeta = removePDFUniqueMetadata(pdf.toString());

                expect(dataWithoutMeta).toEqual(pdfWithoutMeta);
            });
        });

    });

});

/**
 * Removes metadata that can differ between same PDFs such as:
 * id or modification date.
 */
function removePDFUniqueMetadata(data: string) {
    // Get string with UTF8 encoding.
    let dataToReturn: string = data.toString();
    // Remove modification date.
    dataToReturn = dataToReturn.replace(/\/ModDate (.+)?/, '');
    // Remove id.
    dataToReturn = dataToReturn.replace(/\/ID (.+)?/, '');

    return dataToReturn;
}