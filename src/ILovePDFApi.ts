import TaskFactory, { TaskFactoryI } from "@ilovepdf/ilovepdf-js-core/tasks/TaskFactory";
import Auth from "@ilovepdf/ilovepdf-js-core/auth/Auth";
import JWT from "@ilovepdf/ilovepdf-js-core/auth/JWT";
import ILovePDFTool from "@ilovepdf/ilovepdf-js-core/types/ILovePDFTool";
import XHRPromise from "@ilovepdf/ilovepdf-js-core/utils/XHRPromise";
import XHRInterface from '@ilovepdf/ilovepdf-js-core/utils/XHRInterface';
import globals from '@ilovepdf/ilovepdf-js-core/constants/globals.json';
import TaskI from "@ilovepdf/ilovepdf-js-core/tasks/TaskI";
import TaskTypeNotExistsError from '@ilovepdf/ilovepdf-js-core/errors/TaskTypeNotExistsError';
import ILovePDFCoreApi, { GetSignatureStatus, GetReceiverInfoResponse } from '@ilovepdf/ilovepdf-js-core/ILovePDFCoreApi';

export interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     */
    newTask: (taskType: ILovePDFTool) => TaskI;
    /**
     * Returns a task lists from ILovePDF servers ordered from newest to older.
     */
    listTasks: (params?: ListTasksParams) => Promise< Array<TaskI> >;
    /**
     * Returns the signature identified by `signatureToken`.
     * @param signatureToken token_requester property from a created signature.
     * @returns Signature.
     */
    getSignatureStatus: (signatureToken: string) => Promise<GetSignatureStatus>;
    /**
     * Returns a list of the created signatures.
     * A pagination system is used to limit the response length.
     * @param page
     * @param pageLimit Limit of objects per page.
     * @returns List of signatures.
     */
    getSignatureList: (page: number, pageLimit: number) => Promise<Array<GetSignatureStatus>>;
    /**
     * Voids a non-completed signature.
     * @param signatureToken token_requester property from a created signature.
     */
    voidSignature: (signatureToken: string) => Promise< void >;
    /**
     * Increases the expiration days limit from a signature.
     * @param signatureToken token_requester property from a created signature.
     * @param daysAmount Days to increase.
     */
    increaseSignatureExpirationDays: (signatureToken: string, daysAmount: number) => Promise<void>;
    /**
     * Sends reminders to all the receivers to sign, validate or witness a document.
     * @param signatureToken token_requester property from a created signature.
     */
    sendReminders: (signatureToken: string) => Promise<void>;
    /**
     * Returns a PDF or ZIP file with the original files, uploaded
     * at the beginning of the signature creation.
     * @param signatureToken token_requester property from a created signature.
     * @returns PDF or ZIP file with the original files.
     */
    downloadOriginalFiles: (signatureToken: string) => Promise<Uint8Array>;
    /**
     * Returns a PDF or ZIP file with the signed files.
     * @param signatureToken token_requester property from a created signature.
     * @returns PDF or ZIP file with the signed files.
     */
    downloadSignedFiles: (signatureToken: string) => Promise<Uint8Array>;
    /**
     * Returns a PDF or ZIP file with the audit files that inform about
     * files legitimity.
     * @param signatureToken token_requester property from a created signature.
     * @returns PDF or ZIP file with the audit files.
     */
    downloadAuditFiles: (signatureToken: string) => Promise<Uint8Array>;
    /**
     * Returns a receiver information related to a specific sign process.
     * @param receiverTokenRequester token_requester from a receiver.
     * @returns Receiver information.
     */
    getReceiverInfo: (receiverTokenRequester: string) => Promise<GetReceiverInfoResponse>;
    /**
     * Fixes a receiver's email.
     * @param receiverTokenRequester token_requester from a receiver.
     * @param email New email.
     */
    fixReceiverEmail: (receiverTokenRequester: string, email: string) => Promise< void >;
    /**
     * Fixes a receiver's phone.
     * @param receiverTokenRequester token_requester from a receiver.
     * @param phone New phone.
     */
    fixReceiverPhone: (receiverTokenRequester: string, phone: string) => Promise< void >;
}

export type ILovePDFApiParams = {
    file_encryption_key?: string
};

export default class ILovePDFApi implements ILovePDFApiI {
    private auth: Auth;
    private xhr: XHRInterface;
    private taskFactory: TaskFactoryI;

    constructor(publicKey: string, secretKey: string, params: ILovePDFApiParams = {}) {
        this.xhr = new XHRPromise;
        // Secret key is set for
        this.auth = new JWT(this.xhr, publicKey, secretKey, params);
        this.taskFactory = new TaskFactory();
    }

    /**
     * @inheritdoc
     */
    newTask(taskType: ILovePDFTool) {
        return this.taskFactory.newTask(taskType, this.auth, this.xhr);
    }

    /**
     * @inheritdoc
     */
    async listTasks(params: ListTasksParams = {}) {
        const token = await this.auth.getToken();

        return this.xhr.post<ListTasksResponse>(
            `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/task`,
            {
                secret_key: this.auth.secretKey,
                ...params
            },
            {
                headers: [
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: (res: any) => { return JSON.parse(res) }
            }
        )
        .then(response => {
            const fileArray = [];

            for (const taskJSON of response) {
                try {
                    const task = this.taskFactory.newTask(taskJSON.tool,
                        this.auth,
                        this.xhr,
                        {
                            id: taskJSON.task,
                            server: taskJSON.server
                        });
                    fileArray.push(task);
                }
                catch (error) {
                    // In case of not exist the tool, don't include and continue.
                    if (!(error instanceof TaskTypeNotExistsError)) throw error;
                }
            }

            return fileArray;
        });
    }

    /**
     * @inheritdoc
     */
    async getSignatureStatus(signatureToken: string): Promise<GetSignatureStatus> {
        return ILovePDFCoreApi.getSignatureStatus(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async getSignatureList(page: number = 0, pageLimit: number = 20): Promise<Array<GetSignatureStatus>> {
        return ILovePDFCoreApi.getSignatureList(this.auth, this.xhr, page, pageLimit);
    }

    /**
     * @inheritdoc
     */
    async voidSignature(signatureToken: string): Promise< void > {
        return ILovePDFCoreApi.voidSignature(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async increaseSignatureExpirationDays(signatureToken: string, daysAmount: number): Promise<void> {
        return ILovePDFCoreApi.increaseSignatureExpirationDays(this.auth, this.xhr, signatureToken, daysAmount);
    }

    /**
     * @inheritdoc
     */
    async sendReminders(signatureToken: string): Promise<void> {
        return ILovePDFCoreApi.sendReminders(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async downloadOriginalFiles(signatureToken: string): Promise<Uint8Array> {
        return ILovePDFCoreApi.downloadOriginalFiles(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async downloadSignedFiles(signatureToken: string): Promise<Uint8Array> {
        return ILovePDFCoreApi.downloadSignedFiles(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async downloadAuditFiles(signatureToken: string): Promise<Uint8Array> {
        return ILovePDFCoreApi.downloadAuditFiles(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async getReceiverInfo(receiverTokenRequester: string): Promise<GetReceiverInfoResponse> {
        return ILovePDFCoreApi.getReceiverInfo(this.auth, this.xhr, receiverTokenRequester);
    }

    /**
     * @inheritdoc
     */
    async fixReceiverEmail(receiverTokenRequester: string, email: string): Promise< void > {
        return ILovePDFCoreApi.fixReceiverEmail(this.auth, this.xhr, receiverTokenRequester, email);
    }

    /**
     * @inheritdoc
     */
    async fixReceiverPhone(receiverTokenRequester: string, phone: string): Promise< void > {
        return ILovePDFCoreApi.fixReceiverPhone(this.auth, this.xhr, receiverTokenRequester, phone);
    }

}

type ListTasksParams = {
    page?: number;
    tool?: string;
    status?: string;
    custom_int?: number;
};

type ListTasksResponse = Array< {
    tool: ILovePDFTool;
    process_start: string;
    status: string;
    status_message: string;
    timer: string;
    filesize: number;
    output_filesize: number;
    output_filenumber: number;
    output_extensions: Array<string>;
    server: string;
    task: string;
    file_number: string;
    download_filename: string;
} >;
