import ILovePDFApi from "..";
import dotenv from 'dotenv';
import SignTask from '@ilovepdf/ilovepdf-js-core/tasks/sign/SignTask';
import SignatureFile from "@ilovepdf/ilovepdf-js-core/tasks/sign/elements/SignatureFile";
import Signer from "@ilovepdf/ilovepdf-js-core/tasks/sign/receivers/Signer";
import ILovePDFFile from "../ILovePDFFile";

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('sign') as SignTask;

task.start()
.then(() => {
    const file = new ILovePDFFile('<FILE_PATH>');
    return task.addFile(file);
})
.then(file => {
    const signatureFile = new SignatureFile(file, [{
        type: 'signature',
        position: '300 -100',
        pages: '1',
        size: 28,
    }]);

    return signatureFile;
})
.then(signatureFile => {
    const signer = new Signer('Diego Signer', 'invent@ado.com');
    signer.addFile(signatureFile);
    task.addReceiver(signer);
})
.then(() => {
    return task.process();
})
.then(response => {
    console.log(response);
});