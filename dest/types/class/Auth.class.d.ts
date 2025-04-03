import { TranslationServiceClient } from "@google-cloud/translate";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth.js';
export declare class AuthClass {
    translationClient: TranslationServiceClient | undefined;
    auth: GoogleAuth<JSONClient> | OAuth2Client | undefined;
    vertexAI: VertexAI | undefined;
    project_id: string | undefined;
    private _isTranslateReady;
    private _isVertexReady;
    constructor();
    get isTranslateReady(): boolean;
    get isVertexReady(): boolean;
    private initializeGoogleAPI;
    private _initializeWithServiceAccount;
    private _initializeWithApiKey;
    private _getKeyfile;
}
