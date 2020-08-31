import ILovePDFApi from "..";
import dotenv from 'dotenv';
import SignatureFile from "@ilovepdf/ilovepdf-core/dist/tasks/sign/SignatureFile";
import Signer from "@ilovepdf/ilovepdf-core/dist/tasks/sign/Signer";
import SignTask from "@ilovepdf/ilovepdf-core/dist/tasks/sign/SignTask";

// Load env vars.
dotenv.config();

const api = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

const task = api.newTask('sign') as SignTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    // Requester is the person who sends the document to sign.
    task.requester = {
        name: 'Diego',
        email: 'emailto@test.com'
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
    const signer = new Signer('Diego', 'emailto@test.com', {
        type: 'signer',
        force_signature_type: 'all'
    });
    signer.addFile(signatureFile);
    task.addSigner(signer);

    return task.saveAsTemplate({
        template_name: 'Plantillita',
        mode: 'multiple',
        custom_int: 0,
        custom_string: '0'
    });
})
.then(async () => {
    const template = await api.getSignatureTemplate(task.id);
    const newSignature = api.newTask('sign') as SignTask;
    await newSignature.start()
    await newSignature.processFromTemplate(template);
});