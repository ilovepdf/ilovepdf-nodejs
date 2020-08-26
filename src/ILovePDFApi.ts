import TaskFactory, { TaskFactoryI } from "@ilovepdf/ilovepdf-core/dist/tasks/TaskFactory";
import Auth from "@ilovepdf/ilovepdf-core/dist/auth/Auth";
import JWT from "@ilovepdf/ilovepdf-core/dist/auth/JWT";
import ILovePDFTool from "@ilovepdf/ilovepdf-core/dist/types/ILovePDFTool";
import GetSignerResponse from "@ilovepdf/ilovepdf-core/dist/types/responses/GetSignerResponse";
import XHRPromise from "@ilovepdf/ilovepdf-core/dist/utils/XHRPromise";
import XHRInterface from '@ilovepdf/ilovepdf-core/dist/utils/XHRInterface';
import globals from '@ilovepdf/ilovepdf-core/dist/constants/globals.json';
import TaskI from "@ilovepdf/ilovepdf-core/dist/tasks/TaskI";
import TaskTypeNotExistsError from '@ilovepdf/ilovepdf-core/dist/errors/TaskTypeNotExistsError';
import ILovePDFCoreApi, { UpdateSignerData } from '@ilovepdf/ilovepdf-core/dist/ILovePDFCoreApi';
import GetSignatureTemplateResponse from "@ilovepdf/ilovepdf-core/dist/types/responses/GetSignatureTemplateResponse";

export interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     */
    newTask: (taskType: ILovePDFTool) => TaskI;
    /**
     * Returns a task from ILovePDF servers.
     */
    getTask: (taskId: string) => Promise<TaskI>;
    /**
     * Returns a task lists from ILovePDF servers ordered from newest to older.
     */
    listTasks: (params?: ListTasksParams) => Promise< Array<TaskI> >;
    /**
     * Updates a signer that was also the requester in a signature process.
     * @param signerToken - Signer token of the signer that has to be updated.
     * @param data - Object with values to change.
     */
    updateSigner: (signerToken: string, data: UpdateSignerData) => Promise<GetSignerResponse>;
    /**
     * Updates a signer email in a signature process.
     * @param requesterToken - Request token of the signer that has to be updated.
     * @param email - New email.
     */
    updateSignerEmail: (requesterToken: string, email: string) => Promise<GetSignerResponse>;
    /**
     * Updates a signer phone in a signature process.
     * @param requesterToken - Request token of the signer that has to be updated.
     * @param phone - New phone.
     */
    updateSignerPhone: (requesterToken: string, phone: string) => Promise<GetSignerResponse>;
    /**
     * Gets a template previously created.
     * @param taskId - Task id of the task that created the template.
     */
    getSignatureTemplate: (taskId: string) => Promise<GetSignatureTemplateResponse>;
}

export type ILovePDFApiParams = {
    file_encryption_key?: string
};

type ListTasksParams = {
    page?: number;
    tool?: string;
    status?: string;
    custom_int?: number;
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

    public newTask(taskType: ILovePDFTool) {
        return this.taskFactory.newTask(taskType, this.auth, this.xhr);
    }

    public async getTask(taskId: string) {
        const token = await this.auth.getToken();

        return this.xhr.get(
            `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/task/${ taskId }`,
            {
                headers: [
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: (res: any) => { return JSON.parse(res) }
            }
        )
        .then(data => {
            // This API call causes now ALWAYS an error. It has to be fixed.
            throw new Error(JSON.stringify(data));
        });
    }

    public async listTasks(params: ListTasksParams = {}) {
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

    public async updateSigner(signerToken: string, data: UpdateSignerData) {
        return ILovePDFCoreApi.updateSigner(this.auth, this.xhr, signerToken, data);
    }

    public async updateSignerEmail(requesterToken: string, email: string) {
        return ILovePDFCoreApi.updateSignerEmail(this.auth, this.xhr, requesterToken, email);
    }

    public async updateSignerPhone(requesterToken: string, phone: string) {
        return ILovePDFCoreApi.updateSignerPhone(this.auth, this.xhr, requesterToken, phone);
    }

    public async getSignatureTemplate(taskId: string) {
        return ILovePDFCoreApi.getSignatureTemplate(this.auth, this.xhr, taskId);
    }

}

// ILovePDF type responses from API.

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

// -----