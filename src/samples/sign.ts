import ILovePDFApi from "..";
import dotenv from 'dotenv';
import SignTask from '@ilovepdf/ilovepdf-js-core/tasks/sign/SignTask';
import SignatureFile from "@ilovepdf/ilovepdf-js-core/tasks/sign/SignatureFile";
import Signer from "@ilovepdf/ilovepdf-js-core/tasks/sign/Signer";

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = instance.newTask('sign') as SignTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    // Requester is the person who sends the document to sign.
    task.requester = {
        name: 'Diego',
        email: 'email@totest.com'
    };

    const file = task.getFiles()[0];
    // You can associate to files elements such as
    // signatures, initials, text and more.
    const signatureFile = new SignatureFile(file, [{
        type: 'signature',
        position: '300 -100',
        pages: '1',
        size: 28,
        color: '#000000',
        font: '',
        content: ''
    }]);

    // Signer is the person who signs. Requester and signer can be the
    // same person.
    const signer = new Signer('Diego', 'email@totest.com', {
        type: 'signer',
        force_signature_type: 'all'
    });
    signer.addFile(signatureFile);
    task.addSigner(signer);

    return task.process({
        mode: 'multiple',
        custom_int: 0,
        custom_string: '0'
    });
})
.then(async () => {
    // Wait until task changes its status from 'draft' to 'sent'.
    return await new Promise(r => setTimeout(r, 1000));
})
.then(() => {
    // You can change things of a signer such as
    // his phone, email (if it is in bouncing state)
    // or status (only when requester is also the signer).
    const signer = task.signers[0];
    return signer.updatePhone('654654654');
})
.then(() => {
    // And you can check also the task status.
    return task.getStatus();
})
.then(status => {
    // Signature status.
    console.log(status.document);
    // Email status.
    console.log(status.signers);
});