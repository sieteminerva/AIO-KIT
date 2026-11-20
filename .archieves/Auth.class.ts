import { TranslationServiceClient } from "@google-cloud/translate";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth.js';
import { resolve } from "path";
import { bgRedBright, whiteBright, yellowBright } from "yoctocolors";

export class AuthClass {
  translationClient: TranslationServiceClient | undefined; // Correct type
  auth: GoogleAuth<JSONClient> | OAuth2Client | undefined;
  vertexAI: VertexAI | undefined;
  project_id: string | undefined;
  private _isTranslateReady = false;
  private _isVertexReady = false;

  constructor() {
    this.auth = undefined;
    this.translationClient = undefined;
    this.vertexAI = undefined;
    this.project_id = 'atlantean-tide-454720-b6';
    this.initializeGoogleAPI();
  }

  get isTranslateReady(): boolean {
    return this._isTranslateReady;
  }

  get isVertexReady(): boolean {
    return this._isVertexReady;
  }

  private async initializeGoogleAPI(): Promise<void> {
    try {
      // Try to initialize with service account first
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        await this._initializeWithServiceAccount();
      } else if (process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY2) {
        await this._initializeWithApiKey();
      } else {
        // No authentication - set flags to indicate this
        console.warn("No Google authentication configured.  Google services will be unavailable.");
        this._isTranslateReady = false;
        this._isVertexReady = false;
      }
    } catch (error) {
      console.log(bgRedBright(` GOOGLE AUTHENTICATION     : ${whiteBright(' FAILED ')}`));
      console.error(yellowBright("Error initializing Google API:"), error);
      this._isTranslateReady = false;
      this._isVertexReady = false;
    }
  }



  private async _initializeWithServiceAccount(): Promise<void> {
    const keyFile = this._getKeyfile();
    this.auth = new GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/cloud-translation'],
    });

    const credentials = await this.auth.getCredentials();
    // Create a translation client using @google-cloud/translate
    this.translationClient = new TranslationServiceClient({
      credentials,// Correct type
      libVersion: 'v3'
    });
    if (this.translationClient) this._isTranslateReady = true;

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

  private async _initializeWithApiKey(): Promise<void> {
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
      if (this.translationClient) this._isTranslateReady = true;
    } catch (error) {
      console.log('Error on initializeWithApiKey: ', error)
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
      if (this.vertexAI) this._isVertexReady = true;
    } catch (error) {
      console.log('Error on initializeWithApiKey: ', error)
      this._isVertexReady = false;
    }
  }

  private _getKeyfile() {
    const keyFilePath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS as string);
    if (!keyFilePath) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.");
    }
    return keyFilePath;
  }
}
