import { TranslationServiceClient } from "@google-cloud/translate";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth } from 'google-auth-library';
import { resolve } from "path";
import { bgRedBright, whiteBright, yellowBright } from "yoctocolors";
export class AuthClass {
    constructor() {
        this._isTranslateReady = false;
        this._isVertexReady = false;
        this.auth = undefined;
        this.translationClient = undefined;
        this.vertexAI = undefined;
        this.project_id = 'atlantean-tide-454720-b6';
        this.initializeGoogleAPI();
    }
    get isTranslateReady() {
        return this._isTranslateReady;
    }
    get isVertexReady() {
        return this._isVertexReady;
    }
    async initializeGoogleAPI() {
        try {
            // Try to initialize with service account first
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                await this._initializeWithServiceAccount();
            }
            else if (process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY2) {
                await this._initializeWithApiKey();
            }
            else {
                // No authentication - set flags to indicate this
                console.warn("No Google authentication configured.  Google services will be unavailable.");
                this._isTranslateReady = false;
                this._isVertexReady = false;
            }
        }
        catch (error) {
            console.log(bgRedBright(` GOOGLE AUTHENTICATION     : ${whiteBright(' FAILED ')}`));
            console.error(yellowBright("Error initializing Google API:"), error);
            this._isTranslateReady = false;
            this._isVertexReady = false;
        }
    }
    async _initializeWithServiceAccount() {
        const keyFile = this._getKeyfile();
        this.auth = new GoogleAuth({
            keyFile,
            scopes: ['https://www.googleapis.com/auth/cloud-translation'],
        });
        const credentials = await this.auth.getCredentials();
        // Create a translation client using @google-cloud/translate
        this.translationClient = new TranslationServiceClient({
            credentials, // Correct type
            libVersion: 'v3'
        });
        if (this.translationClient)
            this._isTranslateReady = true;
        const projectId = `atlantean-tide-454720-b6`;
        const location = `us-central1`;
        const apiEndpoint = 'us-central1-aiplatform.googleapis.com';
        this.vertexAI = new VertexAI({
            project: projectId,
            location: location,
            apiEndpoint: apiEndpoint,
            googleAuthOptions: { credentials } // Correct key
        });
        if (this.vertexAI) {
            this._isVertexReady = true;
        }
    }
    async _initializeWithApiKey() {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY2;
        if (!GOOGLE_API_KEY) {
            throw new Error("GOOGLE_API_KEY environment variable not set. Please set your API key.");
        }
        this.auth = new GoogleAuth({
            apiKey: GOOGLE_API_KEY,
            scopes: ['https://www.googleapis.com/auth/cloud-translation'],
        });
        // Create a translation client using @google-cloud/translate
        try {
            this.translationClient = new TranslationServiceClient({
                apiKey: GOOGLE_API_KEY,
                libVersion: 'v3'
            });
            if (this.translationClient)
                this._isTranslateReady = true;
        }
        catch (error) {
            console.log('Error on initializeWithApiKey: ', error);
            this._isTranslateReady = false;
        }
        const projectId = `atlantean-tide-454720-b6`;
        const location = `us-central1`;
        const apiEndpoint = 'us-central1-aiplatform.googleapis.com';
        try {
            this.vertexAI = new VertexAI({
                project: projectId,
                location: location,
                apiEndpoint: apiEndpoint,
                googleAuthOptions: { apiKey: GOOGLE_API_KEY }
            });
            if (this.vertexAI)
                this._isVertexReady = true;
        }
        catch (error) {
            console.log('Error on initializeWithApiKey: ', error);
            this._isVertexReady = false;
        }
    }
    _getKeyfile() {
        const keyFilePath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        if (!keyFilePath) {
            throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.");
        }
        return keyFilePath;
    }
}
