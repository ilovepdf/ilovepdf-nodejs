import ILovePDFApi from "..";
import dotenv from 'dotenv';
import SignTask from '@ilovepdf/ilovepdf-js-core/tasks/sign/SignTask';
import SignatureFile from "@ilovepdf/ilovepdf-js-core/tasks/sign/elements/SignatureFile";
import Signer from "@ilovepdf/ilovepdf-js-core/tasks/sign/receivers/Signer";
import Validator from "@ilovepdf/ilovepdf-js-core/tasks/sign/receivers/Validator";
import Witness from "@ilovepdf/ilovepdf-js-core/tasks/sign/receivers/Witness";

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('sign') as SignTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(file => {
    // Multiple elements.
    const signatureFile = new SignatureFile(file, [
        {
            type: 'signature',
            position: '300 -100',
            pages: '1',
            size: 28,
            color: '#000000',
            font: 'Arial-Unicode-MS',
        },
        {
            type: 'initials',
            position: '300 -100',
            pages: '1',
            size: 28,
            color: '#000000',
        },
        {
            type: 'text',
            position: '300 -100',
            pages: '1',
            size: 28,
            color: '#000000',
            content: 'This is a text field.',
        },
    ]);

    return signatureFile;
})
.then(signatureFile => {
    // RECEIVERS.

    const signer = new Signer('Signer', 'signer@email.com');
    // Add elements to the receivers that need it.
    signer.addFile(signatureFile);

    const validator = new Validator('Validator', 'validator@email.com');

    const witness = new Witness('Witness', 'witness@email.com');

    // Add all receivers to the Sign task.
    task.addReceiver(signer);
    task.addReceiver(validator);
    task.addReceiver(witness);
})
.then(async() => {
    const brandLogo = await task.addFile('<LOGO_URL>');

    return task.process({
        brand_name: 'My company name',
        brand_logo: brandLogo.serverFilename,
        reminders: true,
        uuid_visible: true,
    });
})
.then(response => {
    console.log(response);
});