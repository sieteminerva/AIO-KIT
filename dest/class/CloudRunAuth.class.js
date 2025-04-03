import { TranslationServiceClient } from "@google-cloud/translate";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { bgGreenBright, bgRedBright, bgYellowBright, underline, yellowBright } from "yoctocolors";
import { setAccessTokenPrompt } from "../prompts/Utility/SetAccessToken.prompt.js";
import { resolve } from "path";
export class CloudRunAuthClass {
    constructor() {
        this._isTranslateReady = false;
        this._isVertexReady = false;
        this._authMethod = 'none';
        this.auth = undefined;
        this.translationClient = undefined;
        this.vertexAI = undefined;
        this.project_id = 'atlantean-tide-454720-b6';
        this.setApiKey();
        this.setkeyFile();
    }
    async getGoogleApi() {
        await this.initializeGoogleAPI();
    }
    /**
     * Indicates whether the Google Cloud Translation API client has been initialized and is ready to use.
     * @returns {boolean} True if the Translation API client is ready, false otherwise.
     */
    get isTranslateReady() {
        return this._isTranslateReady;
    }
    /**
     * Indicates whether the Vertex AI client has been initialized and is ready to use.
     * @returns {boolean} True if the Vertex AI client is ready, false otherwise.
     */
    get isVertexReady() {
        return this._isVertexReady;
    }
    _disableServices() {
        this._isTranslateReady = false;
        this._isVertexReady = false;
    }
    _showKeyInfo() {
        if (this._accessToken) {
            this._authMethod = 'accessToken';
            if (this._apiKey) {
                console.warn("Both `access token` and `API key` provided. `Access token` will be used.");
            }
            if ((this._keyFile || this._credentials)) {
                console.warn("Both `Service Account` key and `access token` provided. `Access token` will be used.");
            }
        }
        else if (this._keyFile || this._credentials) {
            this._authMethod = 'serviceAccount';
            if (this._apiKey) {
                console.warn("Both `Service Account key` and `API key` provided. `Service Account key` will be used.");
            }
        }
        else if (this._apiKey) {
            this._authMethod = 'apiKey';
        }
    }
    async initializeGoogleAPI() {
        this._showKeyInfo();
        // console.log('initializeGoogleAPI() => entered the method.');
        try {
            // console.log('this._apiKey =>', this._apiKey);
            // console.log('this._accessToken =>', this._accessToken);
            // console.log('this._keyFile =>', this._keyFile);
            // console.log('this._credentials =>', this._credentials);
            if (this._authMethod === 'accessToken') {
                console.log('initialize Google API => using access token.');
                await this._getAccessTokenFromCloudRun();
                await this._initializeWithAccessToken();
            }
            else if (this._authMethod === 'serviceAccount') {
                console.log('initialize Google API => using service account.');
                await this._initializeWithServiceAccount();
            }
            else if (this._authMethod === 'apiKey') {
                console.log('initialize Google API => using api keys.');
                await this._initializeWithApiKey();
            }
            else {
                console.warn("No Google authentication configured (service account or API key). Attempting Cloud Run authentication.");
            }
        }
        catch (error) {
            console.error(yellowBright("Error initializing Google API:"), error);
            this._disableServices();
        }
    }
    /**
     * Gets an access token by prompting the user to authenticate with the Cloud Run service.
     *
     * @returns {Promise<void>}
     */
    async _getAccessTokenFromCloudRun() {
        try {
            await this.displayAuthUrl();
            this._accessToken = await setAccessTokenPrompt();
            if (this._accessToken) {
                console.log('initializeGoogleAPI() => using access token.');
                await this._initializeWithAccessToken();
                console.log(yellowBright(`    ACCESS TOKEN RECIEVED   => `) + yellowBright(`${this._accessToken?.substring(0, 10)}...`)); // Show a part of the token
            }
            else {
                // No authentication - set flags to indicate this
                console.warn("No Google authentication configured.  Google services will be unavailable.");
                this._disableServices();
            }
        }
        catch (error) {
            console.error('Error getting access token:', error);
        }
    }
    async _initializeWithAccessToken() {
        console.log('_initializeWithAccessToken() => entered the method.');
        try {
            this.auth = new OAuth2Client();
            this.auth.setCredentials({ access_token: this._accessToken });
            const apiKey = this.auth.apiKey;
            this._initializeTranslateClient({ apiKey });
            this._initializeVertexAI({ apiKey });
        }
        catch (error) {
            console.error(`Error initialize With AccessToken: ${error}`);
            this._disableServices();
        }
    }
    async _initializeWithServiceAccount() {
        try {
            this.auth = new GoogleAuth({
                keyFile: this._keyFile ?? undefined,
                credentials: this._credentials ?? undefined,
                scopes: ['https://www.googleapis.com/auth/cloud-translation'],
            });
            this._initializeTranslateClient();
            this._initializeVertexAI();
        }
        catch (error) {
            this._disableServices();
        }
    }
    async _initializeWithApiKey() {
        try {
            this.auth = new GoogleAuth({
                apiKey: this._apiKey ?? undefined,
                scopes: ['https://www.googleapis.com/auth/cloud-translation'],
            });
            this._initializeTranslateClient();
            this._initializeVertexAI();
        }
        catch (error) {
            this._disableServices();
        }
    }
    _initializeVertexAI(opts) {
        const projectId = `atlantean-tide-454720-b6`;
        const location = `us-central1`;
        const apiEndpoint = 'us-central1-aiplatform.googleapis.com';
        try {
            this.vertexAI = new VertexAI({
                project: projectId,
                location: location,
                apiEndpoint: apiEndpoint,
                googleAuthOptions: {
                    credentials: opts?.credentials || this._credentials || undefined,
                    apiKey: opts?.apiKey || this._apiKey || undefined,
                    keyFile: opts?.keyFile || this._keyFile || undefined,
                }
            });
            // console.log('vertexAI object =>', this.vertexAI)
            if (this.vertexAI)
                this._isVertexReady = true;
        }
        catch (error) {
            this._isVertexReady = false;
        }
    }
    _initializeTranslateClient(opts) {
        try {
            this.translationClient = new TranslationServiceClient({
                credentials: opts?.credentials || this._credentials || undefined,
                apiKey: opts?.apiKey || this._apiKey || undefined,
                keyFile: opts?.keyFile || this._keyFile || undefined,
                libVersion: 'v3'
            });
            // console.log('translateClient object =>', this.translateClient)
            if (this.translationClient)
                this._isTranslateReady = true;
        }
        catch (error) {
            console.log('Error on initializeWithApiKey: ', error);
            this._isTranslateReady = false;
        }
    }
    async displayAuthUrl() {
        console.log('_getAccessTokenFromCloudRun() => entered the method.');
        const cloudRunURL = process.env.CLOUD_RUN_URL || process.env.CLOUD_RUN_URL1; // Replace with your actual Cloud Run base URL
        // console.log('cloudRunURL', cloudRunURL);
        if (!cloudRunURL) {
            console.error(`_getAccessTokenFromCloudRun() => you must provide your cloud run URL in this file.`);
        }
        const authUrl = `${cloudRunURL}/auth/google`;
        console.log(`\n┌──────────────────────────── Google Authentication Required ──────────────────────────────┐`);
        console.log(`│  Please open the following URL in your browser to authenticate with your Google account: │`);
        console.log('│' + yellowBright(`            ${authUrl}             `) + '│');
        console.log(`│                 After authenticating, you will receive an ${underline(yellowBright('access token'))}.                  │`);
        console.log(`└──────────────────────────────────────────────────────────────────────────────────────────┘\n`);
    }
    _isAuthenticationSuccess() {
        console.log(bgYellowBright(`    GOOGLE AUTHENTICATED  : `) + bgGreenBright(`SUCCESS`)); // Show a part of the token
    }
    _isAuthenticationFailed() {
        console.log(bgYellowBright(` GOOGLE AUTHENTICATION     : ${bgRedBright(' FAILED ')}`));
    }
    /**
       * Sets the API key for Google API authentication.
       *
       * @param {string} apiKey - The Google API key.
       */
    setApiKey(apiKey) {
        this._apiKey = apiKey ? apiKey : process.env.GOOGLE_API_KEY;
    }
    /**
     * Sets the path to the service account key file for Google API authentication.
     *
     * @param {any} credentials - The path to the service account key file.
     */
    setCredentials(credentials) {
        this._credentials = credentials;
    }
    /**
    * Sets the path to the service account key file for Google API authentication.
    *
    * @param {string} keyFile - The path to the service account key file.
    */
    setkeyFile(keyFile) {
        this._keyFile = keyFile ? resolve(keyFile) : resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }
    /**
     * Sets the access token for Cloud Run authentication.
     *
     * @param {string} accessToken - The Cloud Run access token.
     */
    setAccessToken(accessToken) {
        this._accessToken = accessToken;
    }
}
