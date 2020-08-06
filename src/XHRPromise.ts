import XHRInterface, { Options } from '@ilovepdf/ilovepdf-core/dist/utils/XHRInterface';
import ILovePDFFile from './ILovePDFFile';
import axios, { AxiosRequestConfig, ResponseType } from 'axios';
import FormData from 'form-data';

// Use XMLHttpRequest wrapper due to it does not exist in NodeJS.
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

type HTTP_VERB = 'GET' | 'POST' | 'PUT' | 'DELETE' ;

export default class XHRPromise implements XHRInterface {

    public get<T>(url: string, options: Options = {}) {
        return XHRPromise.makeRequest<T>('GET', url, undefined, options);
    }

    public post<T>(url: string, data?: any, options: Options = {}) {
        let injectedData = data;
        let injectedOptions = options;
        // If it is a file, it has special treatment with HTTP extracting its data.
        if (data instanceof ILovePDFFile) {
            [ injectedData, injectedOptions ] = this.injectRequestInformation(data, options);
        }

        return XHRPromise.makeRequest<T>('POST', url, injectedData, injectedOptions);
    }

    // ILovePDFFiles has to be sent with a specific HTTP configuration.
    private injectRequestInformation(data: ILovePDFFile, options: Options): [ Buffer, Options ] {

        // Access to "native" data.
        const formData = data.data;
        const injectedData = formData.getBuffer();
        const extraHeaders = formData.getHeaders();

        // 'form-data' package returns Content-Type as content-type. This is an
        // error due to the first words have to be in upper-case. We fix this here.
        extraHeaders['Content-Type'] = extraHeaders['content-type'];
        delete extraHeaders['content-type'];
        // Inject new headers with old headers.
        let headersArray = !!options.headers ? options.headers : [];
        const headersConcat = Object.entries(extraHeaders).concat(headersArray);

        // Copy object.
        const injectedOptions = { ...options };
        // Set binary option.
        injectedOptions.headers = headersConcat;

        return [ injectedData, injectedOptions ];
    }

    public put<T>(url: string, data?: any, options: Options = {}) {
        return XHRPromise.makeRequest<T>('PUT', url, data, options);
    }

    public delete<T>(url: string, options: Options = {}) {
        return XHRPromise.makeRequest<T>('DELETE', url, undefined, options);
    }

    private static makeRequest<T>(method: HTTP_VERB, url: string, data?: any, options: Options = {}): Promise<T> {
        const requestConfig = XHRPromise.getRequestConfig(options);

        switch (method) {
            case 'GET':
                return XHRPromise.getRequest<T>(url, requestConfig);

            case 'POST':
                return XHRPromise.postRequest<T>(url, requestConfig, data);

            case 'PUT':
                return XHRPromise.putRequest<T>(url, requestConfig, data);

            case 'DELETE':
                return XHRPromise.deleteRequest<T>(url, requestConfig);
        }
    }

    private static getRequest<T>(url: string, config: AxiosRequestConfig): Promise<T> {
        return axios.get<T>(url, config)
        .then(response => {
            return response.data;
        });
    }

    private static deleteRequest<T>(url: string, config: AxiosRequestConfig): Promise<T> {
        return axios.delete<T>(url, config)
        .then(response => {
            return response.data;
        });
    }

    private static postRequest<T>(url: string, config: AxiosRequestConfig, data?: any): Promise<T> {
        return axios.post<T>(url, data, config)
        .then(response => {
            return response.data;
        });
    }

    private static putRequest<T>(url: string, config: AxiosRequestConfig, data?: any): Promise<T> {
        return axios.put<T>(url, data, config)
        .then(response => {
            return response.data;
        });
    }

    private static getRequestConfig(options: Options): AxiosRequestConfig {
        const headers: any = {};
        if (!!options.headers) {
            options.headers.forEach(([ key, value ]) => {
                headers[key] = value;
            });

        }

        // In case of auth system, credentials are enabled by default.
        const withCredentials = !!headers['Authorization'];

        // Configuration to not encode in case of binary file.
        const responseType: ResponseType | undefined = !!options.binary ? 'arraybuffer' : 'text';

        // Transform response.
        const { transformResponse } = options;

        return {
            headers,
            withCredentials,
            responseType,
            transformResponse
        };
    }

}
