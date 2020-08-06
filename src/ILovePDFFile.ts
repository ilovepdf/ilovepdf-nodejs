import BaseFile from "@ilovepdf/ilovepdf-core/dist/tasks/BaseFile";
import FormData from 'form-data';
import fs from 'fs';

export default class ILovePDFFile extends BaseFile {
    private file: Buffer;

    constructor(filepath: string) {
        const basename = getBasename(filepath);
        super('', '', basename);

        const file = fs.readFileSync(filepath);
        this.file = file;
    }

    get data(): FormData {
        // Create each time due to 'task'
        // property could change previously.
        const formData = new FormData();
        formData.append('task', this.taskId);
        formData.append('file', this.file, { filename: this.filename });
        return formData;
    }

}

function getBasename(path: string): string {
    const firstIndex = path.lastIndexOf('/') + 1;

    if (firstIndex === -1) throw new Error('Path is malformed');

    const basename = path.substring(firstIndex);

    return basename;
}