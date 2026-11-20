import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth.js';
import { TranslationServiceClient } from '@google-cloud/translate'; // Import the correct class
import { bgRedBright, whiteBright } from 'yoctocolors';
import { VertexAI } from '@google-cloud/vertexai';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export class AuthClassKeyFile {
  translate: any;
  translationClient: TranslationServiceClient; // Correct type
  auth: GoogleAuth<JSONClient> | undefined;
  vertexAI: VertexAI | undefined; // Add Vertex AI client
  project_id: string | undefined;

  constructor() {
    this.auth = undefined;
    this.translationClient = undefined as any; // Initialize as undefined
    this.vertexAI = undefined; // Initialize as undefined
    this.project_id = 'atlantean-tide-454720-b6';
    this.initializeGoogleAPI();
  }

  /**
   * 
   * @private
   * Initializes the Google API clients for Translation and Vertex AI.
   * This function sets up authentication using a service account key file,
   * creates clients for the Google Cloud Translation API (both using `googleapis` and `@google-cloud/translate`),
   * and initializes the Vertex AI client.
   *
   * @throws {Error} Throws an error if the Google API initialization fails.
   *
   * @example
   * ```typescript
   * // Example of how this function is called internally:
   * const authClass = new AuthClass(); // This will call initializeGoogleAPI() in the constructor
   * 
   * ```
   * @returns {Promise<void>}
   *
   */
  private async initializeGoogleAPI(): Promise<void> {
    try {

      // const credentials = await this._getCredentials();
      const keyFile = this._getKeyfile();
      // console.log('ENV: : ', process.env)
      // Authenticate using the service account key
      this.auth = new google.auth.GoogleAuth({
        keyFile,
        // credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-translation'],
      });
      console.log('AUTH obj :', this.auth);
      if (!this.auth) console.log(bgRedBright(` GOOGLE AUTHENTICATION     : ${whiteBright(' FAILED ')}`));

      // const accessToken = await this.auth.getAccessToken();
      // console.log('accessToken :', accessToken);

      // Create a translation client using googleapis
      this.translate = google.translate({ version: 'v3', auth: this.auth });

      // Create a translation client using @google-cloud/translate
      this.translationClient = new TranslationServiceClient({
        keyFile,
        libVersion: 'v3'
        // credentials,
        // credentials: GOOGLE_CONFIG_KEY
      });

      const projectId = `atlantean-tide-454720-b6`; // credentials.project_id;
      const location = `us-central1`; // 'global'; // Or your preferred location
      const apiEndpoint = 'us-central1-aiplatform.googleapis.com';
      this.vertexAI = new VertexAI({ project: projectId, location: location, apiEndpoint: apiEndpoint });
      console.log('Vertex AI obj :', this.vertexAI);
      if (!this.vertexAI) console.log(bgRedBright(` VERTEX AI INITIALIZATION  : ${whiteBright(' FAILED ')}`));

    } catch (error) {
      console.error("Error initializing Google API:", error);
      throw error;
    }
  }

  /**
   * Reads the contents of the key file and parses it as JSON.
   * @throws {Error} If the GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.
   * @returns The parsed key file content as JSON.
   */
  private async _getCredentials() {

    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!keyFilePath) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.");
    }
    // Read the contents of the key file
    const keyFileContent = await readFile(resolve(keyFilePath), 'utf-8');
    // Parse the key file content as JSON
    const credentials = JSON.parse(keyFileContent);

    // console.log(bgWhiteBright(` GOOGLE KEY FILE `), credentials);
    return credentials;
  }

  /**
   * Retrieves the file path of the Google Cloud service account key file.
   * 
   * @throws {Error} If the GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.
   * @returns {string} The resolved path to the key file.
   */

  private _getKeyfile() {

    const keyFilePath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS as string);

    if (!keyFilePath) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.");
    }

    // console.log(bgWhiteBright(` GOOGLE KEY FILE `), keyFileJson);
    return keyFilePath;
  }
}
