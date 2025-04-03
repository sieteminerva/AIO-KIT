import { TranslationServiceClient } from "@google-cloud/translate";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth.js';
export declare class CloudRunAuthClass {
    auth: GoogleAuth<JSONClient> | OAuth2Client | undefined;
    translationClient: TranslationServiceClient | undefined;
    vertexAI: VertexAI | undefined;
    project_id: string | undefined;
    private _isTranslateReady;
    private _isVertexReady;
    private _accessToken;
    private _apiKey;
    private _credentials;
    private _keyFile;
    private _authMethod;
    constructor();
    getGoogleApi(): Promise<void>;
    /**
     * Indicates whether the Google Cloud Translation API client has been initialized and is ready to use.
     * @returns {boolean} True if the Translation API client is ready, false otherwise.
     */
    get isTranslateReady(): boolean;
    /**
     * Indicates whether the Vertex AI client has been initialized and is ready to use.
     * @returns {boolean} True if the Vertex AI client is ready, false otherwise.
     */
    get isVertexReady(): boolean;
    private _disableServices;
    private _showKeyInfo;
    private initializeGoogleAPI;
    /**
     * Gets an access token by prompting the user to authenticate with the Cloud Run service.
     *
     * @returns {Promise<void>}
     */
    private _getAccessTokenFromCloudRun;
    private _initializeWithAccessToken;
    private _initializeWithServiceAccount;
    private _initializeWithApiKey;
    private _initializeVertexAI;
    private _initializeTranslateClient;
    displayAuthUrl(): Promise<void>;
    private _isAuthenticationSuccess;
    private _isAuthenticationFailed;
    /**
       * Sets the API key for Google API authentication.
       *
       * @param {string} apiKey - The Google API key.
       */
    setApiKey(apiKey?: string): void;
    /**
     * Sets the path to the service account key file for Google API authentication.
     *
     * @param {any} credentials - The path to the service account key file.
     */
    setCredentials(credentials?: any): void;
    /**
    * Sets the path to the service account key file for Google API authentication.
    *
    * @param {string} keyFile - The path to the service account key file.
    */
    setkeyFile(keyFile?: string): void;
    /**
     * Sets the access token for Cloud Run authentication.
     *
     * @param {string} accessToken - The Cloud Run access token.
     */
    setAccessToken(accessToken: string): void;
}
