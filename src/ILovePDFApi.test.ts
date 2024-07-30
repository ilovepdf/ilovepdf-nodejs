import dotenv from 'dotenv';
import ILovePDFApi from "./ILovePDFApi";
import Task from '@ilovepdf/ilovepdf-js-core/tasks/Task';
import ILovePDFFile from './ILovePDFFile';
import path from 'path';
import SignTask from '@ilovepdf/ilovepdf-js-core/tasks/sign/SignTask';
import SignatureFile from '@ilovepdf/ilovepdf-js-core/tasks/sign/elements/SignatureFile';
import Signer from '@ilovepdf/ilovepdf-js-core/tasks/sign/receivers/Signer';

// Load env vars.
dotenv.config();

const api = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ILovePDFApi', () => {

    it('gets the remaining files', async () => {
        const task = api.newTask('merge');

        await task.start()

        // Be careful with this test. In case of being an admin, `remainingFiles`
        // is `undefined` due to they have no limits.
        expect( typeof task.remainingFiles === 'number' ).toBeTruthy()
    });

    it('does not get the pdfinfo', async () => {
        const task = api.newTask('merge');

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Be careful with this test. In case of being an admin, `remainingFiles`
        // is `undefined` due to they have no limits.
        expect(file.info).toBeUndefined()
    });

    it('does not get the pdfinfo with local file', async () => {
        const task = api.newTask('merge');

        await task.start()

        const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
        await task.addFile(file, { info: false });

        // Be careful with this test. In case of being an admin, `remainingFiles`
        // is `undefined` due to they have no limits.
        expect(file.info).toBeUndefined()
    });

    it('does not get the pdfinfo if specified', async () => {
        const task = api.newTask('merge');

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { info: false });

        // Be careful with this test. In case of being an admin, `remainingFiles`
        // is `undefined` due to they have no limits.
        expect(file.info).toBeUndefined()
    });

    it('gets the pdfinfo if specified', async () => {
        const task = api.newTask('merge');

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { info: true });

        // Be careful with this test. In case of being an admin, `remainingFiles`
        // is `undefined` due to they have no limits.
        expect(file.info).toBeDefined()
    });

    it('gets the pdfinfo if specified with file', async () => {
        const task = api.newTask('merge');

        await task.start()

        const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
        await task.addFile(file, { info: true });

        // Be careful with this test. In case of being an admin, `remainingFiles`
        // is `undefined` due to they have no limits.
        expect(file.info).toBeDefined()
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
            size: 40,
        }]);

        const signer = new Signer('Diego Signer', 'invent@ado.com');
        signer.addFile(signatureFile);
        task.addReceiver(signer);

        const response = await task.process();

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

    describe('Signature management', () => {

        it('gets a signature status', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            const { signers } = await api.getSignatureStatus(token_requester);

            expect( signers[0].email ).toBe('invent@ado.com');
        });

        it('gets a signature list', async () => {
            // First task.

            let task = api.newTask('sign') as SignTask;

            await task.start()

            let file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            let signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            let signer = new Signer('Manolo', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            await task.process();

            // Second task.

            task = api.newTask('sign') as SignTask;

            await task.start()

            file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            signer = new Signer('Paquito', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            await task.process();

            const signatureList = await api.getSignatureList(0, 2);

            const paquitoName = signatureList[0].signers[0].name;

            const manoloName = signatureList[1].signers[0].name;

            expect( paquitoName ).toBe('Paquito');
            expect( manoloName ).toBe('Manolo');
        });

        it('voids a signature', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // Wait to send emails due to this is made
            // in background.
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 2000);
            });

            // Void signature and look that it is correctly invalidated.
            await api.voidSignature(token_requester);

            const { status } = await api.getSignatureStatus(token_requester);

            expect(status).toBe('void');
        });

        it('increases a signature expiration days', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            // Days by default.
            const BASE_DAYS = 120;

            const { token_requester } = await task.process({expiration_days: BASE_DAYS});

            // Increase expiration days.
            const INCREASED_DAYS = 3;
            await api.increaseSignatureExpirationDays(token_requester, INCREASED_DAYS);

            const { created, expires } = await api.getSignatureStatus(token_requester);

            const creationDate = new Date( created );
            const expirationDate = new Date( expires );

            const diffDays = dateDiffInDays(creationDate, expirationDate);

            expect(diffDays).toBe(BASE_DAYS + INCREASED_DAYS);
        });

        it('sends reminders', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // Wait to send emails due to this is made
            // in background.
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 2000);
            });

            // Due to we can test that email was sent, a limit exception is forced.
            await api.sendReminders(token_requester);
            await api.sendReminders(token_requester);

            try {
                await api.sendReminders(token_requester);
                fail( 'it has to fail.' );
            }
            catch(err) {
                expect(err.message).toBe('Request failed with status code 400');
            }

        });

        it('downloads original files', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            const rawData = await api.downloadOriginalFiles(token_requester);

            expect(rawData.length).toBeGreaterThan(0);
        });

        it('downloads signed files', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // We can't test downloaded data due to the signature is not finished.
            // But we want to test that the connection was successful, so the
            // exception is the trigger to know that the connection was successful.
            try {
                await api.downloadSignedFiles(token_requester);
                fail( 'it has to fail.' );
            }
            catch(err) {
                // Due to it was treated as binary data.
                const dataBuf = JSON.parse(err.response.data.toString());
                expect( dataBuf.error.message ).toBe('We can\'t serve the download. Audit trail is only ready when signature is completed');
            }

        });

        it('downloads audit files', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // We can't test downloaded data due to the signature is not finished.
            // But we want to test that the connection was successful, so the
            // exception is the trigger to know that the connection was successful.
            try {
                await api.downloadAuditFiles(token_requester);
                fail( 'it has to fail.' );
            }
            catch(err) {
                // Due to it was treated as binary data.
                const dataBuf = JSON.parse(err.response.data.toString());
                expect( dataBuf.error.message ).toBe('We can\'t serve the download. Audit trail is only ready when signature is completed');
            }

        });

        it('gets receiver information', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process();

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Due to we can test that email was sent, a limit exception is forced.
            const { name } = await api.getReceiverInfo(token_requester);

            expect(name).toBe('Diego Signer');
        });

        it('fix receiver email', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process();

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Test that connection was established.
            try {
                await api.fixReceiverEmail(token_requester, 'newemail@email.com');
                fail( 'it has to fail.' );
            }
            catch(err) {
                const data = JSON.parse(err.response.data.toString());
                // Due to it was treated as binary data.
                expect( data.error.param.email[0] ).toBe('Email does not need to be fixed');
            }

        });

        it('fix receiver phone', async () => {
            const task = api.newTask('sign') as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process();

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Test that connection was established.
            try {
                await api.fixReceiverPhone(token_requester, '34654654654');
                fail( 'it has to fail.' );
            }
            catch(err) {
                const data = JSON.parse(err.response.data.toString());
                // Due to it was treated as binary data.
                expect( data.error.param.phone[0] ).toBe('Phone does not need to be fixed');
            }

        });

    });

});

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a: Date, b: Date): number {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}
