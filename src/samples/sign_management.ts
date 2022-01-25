import ILovePDFApi from "..";
import dotenv from 'dotenv';

// Load env vars.
dotenv.config();

const instance = new ILovePDFApi(process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

// Get a list of all created signature requests.
instance.getSignatureList()
.then(list => {
    console.log('List of signatures.');
    console.log(list);
});

// Get the first page, with max number of 50 entries per page (default is 20, max is 100).
instance.getSignatureList(0, 50)
.then(list => {
    console.log('List of signatures.');
    console.log(list);
});

// Get the current status of the signature.
instance.getSignatureStatus('<SIGNATURE_TOKEN_REQUESTER>')
.then(status => {
    console.log('Signature status.');
    console.log(status);
});

// Get information about a specific receiver.
instance.getReceiverInfo('<RECEIVER_TOKEN_REQUESTER>')
.then(receiverInfo => {
    console.log('Information related to a specific receiver.');
    console.log(receiverInfo);
});

// Downloads the signature original files.
instance.downloadOriginalFiles('<SIGNATURE_TOKEN_REQUESTER>')
.then(data => {
    console.log('File stream.');
});

// Downloads the signature signed files.
instance.downloadSignedFiles('<SIGNATURE_TOKEN_REQUESTER>')
.then(data => {
    console.log('File stream.');
});

// Downloads the signature audit files.
instance.downloadAuditFiles('<SIGNATURE_TOKEN_REQUESTER>')
.then(data => {
    console.log('File stream.');
});

// Correct the email address of a receiver in the event that the email was delivered to an invalid email address.
instance.fixReceiverEmail('<RECEIVER_TOKEN_REQUESTER>', 'new@email.com');

// Correct the mobile number of a signer in the event that the SMS was delivered to an invalid mobile number.
instance.fixReceiverPhone('<RECEIVER_TOKEN_REQUESTER>', '34666666666');

// This endpoint sends an email reminder to pending receivers. It has a daily limit quota (check the docs to know the daily quota).
instance.sendReminders('<SIGNATURE_TOKEN_REQUESTER>');

// Increase the number of days to '4' in order to prevent the request from expiring and give receivers extra time to perform remaining actions.
instance.increaseSignatureExpirationDays('<SIGNATURE_TOKEN_REQUESTER>', 4);

// Void a signature that is currently in progress.
instance.voidSignature('<SIGNATURE_TOKEN_REQUESTER>');