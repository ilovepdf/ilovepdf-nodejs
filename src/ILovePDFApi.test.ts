import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import ILovePDFApi from "./ILovePDFApi";
import ILovePDFFile from "./ILovePDFFile";
import Task from '@ilovepdf/ilovepdf-core/dist/tasks/Task';

// Load env vars.
dotenv.config();

const api = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ILovePDFApi', () => {

    describe('Api', () => {

        it('gets a Task', () => {
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
                // Force to get an Id due to architecture
                // can't be touched.
                const id = (task as any).id as string;
                return api.getTask(id);
            });
        });

        it('gets a list of Task', () => {
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
                // Force to get an Id due to architecture
                // can't be touched.
                const id = (task as any).id as string;
                return api.listTasks();
            })
            .then(data => {
                // At this point, there is minimum one task.
                const task = data[0];
                expect(task).toBeInstanceOf(Task);
            });
        });

    });

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
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            });
        });

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
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
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

                const dataWithoutMeta = removePDFUniqueMetadata(data.toString());
                const pdfWithoutMeta = removePDFUniqueMetadata(pdf.toString());

                expect(dataWithoutMeta).toEqual(pdfWithoutMeta);
            });
        });

        it('connects a task', async () => {
            const task = api.newTask('split');
            const file = new ILovePDFFile('../tests/input/sample.pdf');

            return task.start()
            .then(task => {
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            })
            .then(task => {
                return task.addFile(file);
            })
            .then(task => {
                return task.process();
            })
            .then(task =>{
                return task.connect('merge');
            })
            .then((connectedTask) => {
                return connectedTask.addFile(file);
            })
            .then((connectedTask) => {
                return connectedTask.process()
            })
            .then((connectedTask) => {
                return connectedTask.download();
            })
            .then(data => {
                // Cast to native class.
                const buffer = data as unknown as Buffer;

                const generatedPDF = buffer.toString();
                const storedPDF = fs.readFileSync(path.resolve(__dirname, '../tests/output/connect.pdf'), 'utf-8');

                const dataWithoutMeta = removePDFUniqueMetadata(generatedPDF);
                const pdfWithoutMeta = removePDFUniqueMetadata(storedPDF);

                expect(dataWithoutMeta).toEqual(pdfWithoutMeta);
            });
        });

        it('deletes a task', async () => {
            const task = api.newTask('split');
            const file = new ILovePDFFile('../tests/input/sample.pdf');

            return task.start()
            .then(task => {
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            })
            .then(task => {
                return task.addFile(file);
            })
            .then(task => {
                return task.process();
            })
            .then(task =>{
                return task.delete();
            });
        });

        it('deletes a file', async () => {
            const task = api.newTask('merge');
            const file = new ILovePDFFile('../tests/input/sample.pdf');

            expect(() => {
                return task.start()
                .then(task => {
                    return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
                })
                .then(task => {
                    return task.addFile(file);
                })
                .then(task => {
                    return task.deleteFile(file);
                })
                .then(() => {
                    return task.process();
                });
            })
            .rejects.toThrow();
        })

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