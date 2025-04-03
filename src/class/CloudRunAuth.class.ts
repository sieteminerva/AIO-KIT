

import { TranslationServiceClient } from "@google-cloud/translate";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { bgGreenBright, bgRedBright, bgYellowBright, underline, yellowBright } from "yoctocolors";
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth.js';
import { setAccessTokenPrompt } from "../prompts/Utility/SetAccessToken.prompt.js";
import { resolve } from "path";

export interface GoogleKeyOptions {
  apiKey?: string;
  keyFile?: string;
  credentials?: any;
}

/**
 * @class CloudRunAuth
 * This class provides the `CloudRunAuthClass` for managing authentication and initialization of Google Cloud services, including Translation API and Vertex AI.
 *
 * ## Overview
 *
 * The `CloudRunAuthClass` simplifies the process of authenticating and interacting with Google Cloud services. It supports multiple authentication methods, including:
 *
 * -   **Access Token:** Authenticate using an access token obtained from a Cloud Run service.
 * -   **Service Account:** Authenticate using a service account key file or credentials.
 * -   **API Key:** Authenticate using a Google API key.
 *
 * The class automatically detects the available authentication method and initializes the necessary Google API clients accordingly. It also provides methods to check the readiness of the Translation API and Vertex AI clients.
 *
 * ## Features
 *
 * -   **Multiple Authentication Methods:** Supports access token, service account, and API key authentication.
 * -   **Automatic Authentication Detection:** Determines the appropriate authentication method based on the provided credentials.
 * -   **Google API Client Initialization:** Initializes the Translation API and Vertex AI clients.
 * -   **Readiness Checks:** Provides methods to check if the Translation API and Vertex AI clients are ready.
 * -   **Cloud Run Authentication:** Supports authentication via a Cloud Run service, prompting the user for an access token.
 * -   **Error Handling:** Includes error handling to gracefully manage authentication and initialization failures.
 * -   **Configuration Options:** Allows configuration of API keys, key files, and credentials.
 *
 * ## Usage
 *
 * ### Installation
 *
 * ```bash
 * npm install @google-cloud/translate @google-cloud/vertexai google-auth-library yoctocolors
 * ```
 *
 * ### Basic Example
 *
 * ```typescript
 * import { CloudRunAuthClass } from './CloudRunAuth.class';
 *
 * async function main() {
 *   const auth = new CloudRunAuthClass();
 *   await auth.getGoogleApi();
 *
 *   if (auth.isTranslateReady) {
 *     console.log('Translation API is ready.');
 *     // Use the translationClient here
 *   }
 *
 *   if (auth.isVertexReady) {
 *     console.log('Vertex AI is ready.');
 *     // Use the vertexAI client here
 *   }
 * }
 *
 * main().catch(console.error);
 * ```
 *
 * ### Authentication Methods
 *
 * #### Access Token
 *
 * 1.  Set up a Cloud Run service that provides an authentication endpoint.
 * 2.  Call `getGoogleApi()` to initiate the authentication process.
 * 3.  The class will prompt the user to visit the authentication URL and enter the received access token.
 *
 * #### Service Account
 *
 * 1.  Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key file.
 * 2.  Alternatively, use `setkeyFile()` or `setCredentials()` to provide the key file path or credentials.
 * 3.  Call `getGoogleApi()` to initialize the Google API clients.
 *
 * #### API Key
 *
 * 1.  Set the `GOOGLE_API_KEY` environment variable to your API key.
 * 2.  Alternatively, use `setApiKey()` to provide the API key.
 * 3.  Call `getGoogleApi()` to initialize the Google API clients.
 *
 * ## Class: CloudRunAuthClass
 *
 * ### Constructor
 *
 * -   `constructor()`: Initializes the `CloudRunAuthClass` with default values and attempts to set the API key and key file from environment variables.
 *
 * ### Methods
 *
 * -   `getGoogleApi()`: Initializes the Google API clients based on the determined authentication method.
 * -   `displayAuthUrl()`: Displays the URL for Google authentication via a Cloud Run service.
 * -   `setApiKey(apiKey?: string)`: Sets the API key for Google API authentication.
 * -   `setCredentials(credentials?: any)`: Sets the service account credentials for Google API authentication.
 * -   `setkeyFile(keyFile?: string)`: Sets the path to the service account key file for Google API authentication.
 * -   `setAccessToken(accessToken: string)`: Sets the access token for Cloud Run authentication.
 *
 * ### Getters
 *
 * -   `isTranslateReady`: Returns `true` if the Translation API client is ready; `false` otherwise.
 * -   `isVertexReady`: Returns `true` if the Vertex AI client is ready; `false` otherwise.
 *
 */
export class CloudRunAuthClass {

  auth: GoogleAuth<JSONClient> | OAuth2Client | undefined;
  translationClient: TranslationServiceClient | undefined;
  vertexAI: VertexAI | undefined;
  project_id: string | undefined;
  private _isTranslateReady = false;
  private _isVertexReady = false;
  private _accessToken: string | undefined;
  private _apiKey: string | undefined;
  private _credentials: any | undefined;
  private _keyFile: string | undefined;
  private _authMethod: 'serviceAccount' | 'apiKey' | 'accessToken' | 'none' = 'none';

  /**
   * Initializes the CloudRunAuthClass.
   *
   * Sets the initial values of the class properties to undefined, and sets the project ID to
   * 'your_project_id'. It also attempts to set the API key and key file using the
   * `setApiKey()` and `setkeyFile()` methods.
   */
  constructor() {
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
   * Retrieves the readiness status of the Google Cloud Translation API client.
   *
   * This getter method provides a way to check if the Translation API client has been
   * successfully initialized and is ready for use. It returns `true` if the client is
   * ready, and `false` otherwise.
   *
   * @returns {boolean} `true` if the Translation API client is ready; `false` otherwise.
   *
   */
  get isTranslateReady(): boolean {
    return this._isTranslateReady;
  }

  /**
   * Retrieves the readiness status of the Vertex AI client.
   *
   * This getter method allows you to check if the Vertex AI client has been successfully
   * initialized and is ready for use. It returns `true` if the client is ready, and
   * `false` otherwise.
   *
   * @returns {boolean} `true` if the Vertex AI client is ready; `false` otherwise.
   *
   */
  get isVertexReady(): boolean {
    return this._isVertexReady;
  }

  /**
   * Disables the Google Cloud Translation API and Vertex AI services.
   *
   * This private method is used to disable both the Translation API and Vertex AI services
   * by setting their respective readiness flags (`_isTranslateReady` and `_isVertexReady`)
   * to `false`. This is typically done when an error occurs during the initialization
   * of these services or when they are no longer needed.
   *
   * @private
   *
   * @example
   * ```typescript
   * 
   * this._disableServices(); // Disables both Translation API and Vertex AI services.
   * 
   * ```
   */
  private _disableServices() {
    this._isTranslateReady = false;
    this._isVertexReady = false;
  }

  /**
   * Determines and sets the authentication method based on the provided credentials, key file, or access token.
   *
   * This method analyzes the presence of an access token, service account key file, or API key to determine the
   * appropriate authentication method. It sets the `_authMethod` property accordingly and logs warnings if multiple
   * authentication methods are provided, prioritizing the access token, followed by the service account key.
   *
   * @remarks
   * The priority order for authentication methods is:
   * 1. Access Token
   * 2. Service Account Key
   * 3. API Key
   *
   * @example
   * ```typescript
   * 
   *    // If both an access token and an API key are provided, the access token will be used, and a warning will be logged.
   *    this._accessToken = 'your_access_token';
   *    this._apiKey = 'your_api_key';
   *    this._showKeyInfo(); // _authMethod will be 'accessToken'
   * 
   * ```
   */

  private _showKeyInfo() {
    if (this._accessToken) {
      this._authMethod = 'accessToken';
      if (this._apiKey) {
        console.warn("Both `access token` and `API key` provided. `Access token` will be used.");
      }
      if ((this._keyFile || this._credentials)) {
        console.warn("Both `Service Account` key and `access token` provided. `Access token` will be used.");
      }
    } else if (this._keyFile || this._credentials) {
      this._authMethod = 'serviceAccount';
      if (this._apiKey) {
        console.warn("Both `Service Account key` and `API key` provided. `Service Account key` will be used.");
      }
    } else if (this._apiKey) {
      this._authMethod = 'apiKey';
    }
  }


  /**
 * Initializes the Google API clients based on the determined authentication method.
 *
 * This method is responsible for setting up the Google API clients (Translation and Vertex AI)
 * according to the authentication method specified by `_authMethod`. It supports three
 * authentication methods: access token, service account, and API key. If no authentication
 * method is configured, it attempts to use Cloud Run authentication.
 *
 * The method first calls `_showKeyInfo()` to determine the appropriate authentication method.
 * Then, based on the `_authMethod`, it calls the corresponding initialization method:
 * - `_initializeWithAccessToken()` for access token authentication.
 * - `_initializeWithServiceAccount()` for service account authentication.
 * - `_initializeWithApiKey()` for API key authentication.
 * - If `_authMethod` is 'none', it logs a warning and attempts Cloud Run authentication.
 *
 * If an error occurs during the initialization process, it logs the error and calls
 * `_disableServices()` to disable the services.
 *
 * @private
 * @throws {Error} If there is an error during the initialization of the Google API.
 *
 * @example
 * ```typescript
 * // Assuming _authMethod is 'accessToken'
 * await this.initializeGoogleAPI(); // Initializes with access token
 * ```
 *
 * @async
 */
  /**
   * Initializes the Google API clients based on the determined authentication method.
   *
   * This method orchestrates the initialization of Google API clients (Translation and Vertex AI)
   * based on the authentication method determined by `_showKeyInfo()`. It handles three authentication
   * methods: access token, service account, and API key. If no authentication method is configured,
   * it attempts to use Cloud Run authentication.
   *
   * @remarks
   * This method is a central point for setting up the Google API clients. It uses the `_authMethod`
   * property to decide which initialization path to take. If an error occurs during initialization,
   * it disables the services and logs the error.
   *
   * @throws {Error} If there is an error during the initialization of the Google API.
   *
   * @example
   * ```typescript
   * 
   *    // Assuming _authMethod is 'accessToken'
   *    await this.initializeGoogleAPI(); // Initializes with access token
   * 
   * ```
   */
  private async initializeGoogleAPI(): Promise<void> {
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
      } else if (this._authMethod === 'serviceAccount') {
        console.log('initialize Google API => using service account.');
        await this._initializeWithServiceAccount();
      } else if (this._authMethod === 'apiKey') {
        console.log('initialize Google API => using api keys.');
        await this._initializeWithApiKey();
      } else {
        console.warn("No Google authentication configured (service account or API key). Attempting Cloud Run authentication.");
      }
    } catch (error) {
      console.error(yellowBright("Error initializing Google API:"), error);
      this._disableServices();
    }
  }


  /**
 * Retrieves an access token by prompting the user to authenticate via a Cloud Run service.
 *
 * This method guides the user through the process of obtaining an access token by directing them
 * to a specific URL for authentication. Upon successful authentication, the user is expected to
 * provide the received access token, which is then used to initialize the Google API clients.
 *
 * The method first calls `displayAuthUrl()` to show the user the authentication URL. Then, it
 * uses `setAccessTokenPrompt()` to prompt the user to enter the access token. If the user
 * provides an access token, it initializes the Google API clients using `_initializeWithAccessToken()`.
 * If no access token is provided, it logs a warning and disables the Google services using
 * `_disableServices()`.
 *
 * If an error occurs during the process, it logs the error.
 *
 * @private
 * @throws {Error} If there is an error during the process of getting the access token.
 *
 * @example
 * ```typescript
 * // Initiates the process of getting an access token from the user.
 * await this._getAccessTokenFromCloudRun();
 * ```
 *
 * @async
 */
  /**
 * Retrieves an access token by prompting the user to authenticate via a Cloud Run service.
 *
 * This method guides the user through the process of obtaining an access token by directing them
 * to a specific URL for authentication. Upon successful authentication, the user is expected to
 * provide the received access token, which is then used to initialize the Google API clients.
 *
 * @remarks
 * This method relies on the `setAccessTokenPrompt` function to interact with the user and obtain
 * the access token. If the user fails to provide an access token, the Google services are disabled.
 *
 * @throws {Error} If there is an error during the process of getting the access token.
 *
 * @example
 * ```typescript
 * 
 *    // Initiates the process of getting an access token from the user.
 *    await this._getAccessTokenFromCloudRun();
 * 
 * ```
 *
 */
  private async _getAccessTokenFromCloudRun(): Promise<void> {

    try {
      await this.displayAuthUrl()
      this._accessToken = await setAccessTokenPrompt()
      if (this._accessToken) {
        console.log('initializeGoogleAPI() => using access token.');
        await this._initializeWithAccessToken();
        console.log(yellowBright(`    ACCESS TOKEN RECIEVED   => `) + yellowBright(`${this._accessToken?.substring(0, 10)}...`)); // Show a part of the token
      } else {
        // No authentication - set flags to indicate this
        console.warn("No Google authentication configured.  Google services will be unavailable.");
        this._disableServices();
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }


  /**
 * Initializes the Google API clients using an access token.
 *
 * This method sets up the Google API clients (Translation and Vertex AI) using a provided
 * access token. It creates a new instance of `OAuth2Client`, sets the credentials using the
 * access token, and then initializes the Translation and Vertex AI clients using the obtained
 * API key.
 *
 * If an error occurs during the initialization process, it logs the error and disables the
 * services using `_disableServices()`.
 *
 * @private
 * @throws {Error} If there is an error during the initialization of the Google API clients.
 *
 * @example
 * ```typescript
 * await this._initializeWithAccessToken();
 * ```
 * @async
 */
  /**
   * Initializes the Google API clients using an access token.
   *
   * @remarks
   * This method uses the provided access token to initialize the Google API clients (Translation and Vertex AI)
   * by creating a new instance of `OAuth2Client` and setting the credentials using the access token.
   * It then uses the obtained API key to initialize the Translation and Vertex AI clients.
   *
   * If an error occurs during initialization, it disables the services and logs the error.
   * @see {@link https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest/google-auth-library/oauth2client | OAuth2Client}
   * @example
   * ```typescript
   * 
   *    await this._initializeWithAccessToken();
   * 
   * ```
   */
  private async _initializeWithAccessToken(): Promise<void> {
    console.log('_initializeWithAccessToken() => entered the method.');
    try {
      this.auth = new OAuth2Client();
      this.auth.setCredentials({ access_token: this._accessToken });
      const apiKey = this.auth.apiKey;
      this._initializeTranslateClient({ apiKey });
      this._initializeVertexAI({ apiKey });

    } catch (error) {
      console.error(`Error initialize With AccessToken: ${error}`)
      this._disableServices();
    }
  }

  /**
 * Initializes the Google API clients using a service account.
 *
 * This method configures the Google API clients (Translation and Vertex AI) using a service
 * account key file or credentials. It creates a new instance of `GoogleAuth`, sets the
 * necessary scopes for cloud translation, and then initializes the Translation and Vertex AI
 * clients.
 *
 * The method uses either the `_keyFile` or `_credentials` property of the class to set up the
 * authentication. If both are provided, it prioritizes `_keyFile`.
 *
 * If an error occurs during the initialization process, it disables the services using
 * `_disableServices()`.
 *
 * @private
 * @throws {Error} If there is an error during the initialization of the Google API clients.
 *
 * @example
 * ```typescript
 * await this._initializeWithServiceAccount();
 * ```
 *
 * @async
 */
  /**
   * Initializes the Google API clients using a service account.
   *
   * @remarks
   * This method uses the service account key file and credentials to initialize the Google API clients 
   * (Translation and Vertex AI) by creating a new instance of `GoogleAuth`. It sets the necessary 
   * scopes for cloud translation and proceeds to initialize the Translation and Vertex AI clients.
   *
   * If an error occurs during initialization, it disables the services.
   * 
   * @see {@link https://googleapis.dev/nodejs/google-auth-library/5.6.1/ | GoogleAuth}
   *
   * @throws {Error} If there is an error during the initialization of the Google API clients.
   * @example
   * ```typescript
   * 
   *    await this._initializeWithAccessToken();
   * 
   * ```
   */

  private async _initializeWithServiceAccount(): Promise<void> {

    try {

      this.auth = new GoogleAuth({
        keyFile: this._keyFile ?? undefined,
        credentials: this._credentials ?? undefined,
        scopes: ['https://www.googleapis.com/auth/cloud-translation'],
      });
      this._initializeTranslateClient();
      this._initializeVertexAI();

    } catch (error) {
      this._disableServices();
    }

  }

  /**
 * Initializes the Google API clients using an API key.
 *
 * This method sets up the Google API clients (Translation and Vertex AI) using a provided API
 * key. It creates a new instance of `GoogleAuth`, sets the necessary scopes for cloud
 * translation, and then initializes the Translation and Vertex AI clients.
 *
 * The method uses the `_apiKey` property of the class to set up the authentication.
 *
 * If an error occurs during the initialization process, it disables the services using
 * `_disableServices()`.
 *
 * @private
 * @throws {Error} If there is an error during the initialization of the Google API clients.
 *
 * @example
 * ```typescript
 * await this._initializeWithApiKey();
 * ```
 *
 * @async
 */

  /**
   * Initializes the Google API clients using an API key.
   *
   * @remarks
   * This method uses the API key to initialize the Google API clients (Translation and Vertex AI)
   * by creating a new instance of `GoogleAuth`. It sets the necessary scopes for cloud 
   * translation and proceeds to initialize the Translation and Vertex AI clients.
   *
   * If an error occurs during initialization, it disables the services.
   * 
   * @see {@link https://googleapis.dev/nodejs/google-auth-library/5.6.1/ | GoogleAuth}
   *
   * @throws {Error} If there is an error during the initialization of the Google API clients.
   * @example
   * ```typescript
   * 
   *    await this._initializeWithApiKey();
   * 
   * ```
   */
  private async _initializeWithApiKey(): Promise<void> {
    try {

      this.auth = new GoogleAuth({
        apiKey: this._apiKey ?? undefined,
        scopes: ['https://www.googleapis.com/auth/cloud-translation'],
      });

      this._initializeTranslateClient();
      this._initializeVertexAI();

    } catch (error) {
      this._disableServices();
    }
  }

  /**
 * Initializes the Vertex AI client.
 *
 * This method creates a new instance of the Vertex AI client using the provided options or the
 * class's stored credentials, API key, or key file. It configures the client with the project ID,
 * location, and API endpoint.
 *
 * The method prioritizes the options provided in the `opts` parameter over the class's stored
 * credentials, API key, or key file. If `opts` is not provided, it uses the class's stored
 * values.
 *
 * If the initialization is successful, the `_isVertexReady` flag is set to `true`. Otherwise,
 * it's set to `false`.
 *
 * @private
 * @param {GoogleKeyOptions} [opts] - Optional configuration options for the Vertex AI client.
 * @param {string} [opts.apiKey] - Optional API key to use for authentication.
 * @param {string} [opts.keyFile] - Optional path to a service account key file.
 * @param {any} [opts.credentials] - Optional service account credentials.
 *
 * @example
 * ```typescript
 * 
 * // Initialize Vertex AI with a specific API key
 * this._initializeVertexAI({ apiKey: 'your_api_key' });
 * 
 * ```
 */

  /**
   * Initializes the Vertex AI client.
   *
   * This method creates a new instance of the Vertex AI client using the provided options or the
   * class's stored credentials, API key, or key file. It configures the client with the project ID,
   * location, and API endpoint.
   *
   * @param {GoogleKeyOptions} [opts] - Optional configuration options for the Vertex AI client.
   * @param {string} [opts.apiKey] - Optional API key to use for authentication.
   * @param {string} [opts.keyFile] - Optional path to a service account key file.
   * @param {any} [opts.credentials] - Optional service account credentials.
   *
   * @remarks
   * If the initialization is successful, the `_isVertexReady` flag is set to `true`. Otherwise, it's set to `false`.
   *
   * @example
   * ```typescript
   * 
   * // Initialize Vertex AI with a specific API key
   * this._initializeVertexAI({ apiKey: 'your_api_key' });
   * 
   * ```
   *
   */
  private _initializeVertexAI(opts?: GoogleKeyOptions) {

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
      if (this.vertexAI) this._isVertexReady = true;
    } catch (error) {
      this._isVertexReady = false;
    }
  }

  /**
 * Initializes the Google Cloud Translation API client.
 *
 * This method creates a new instance of the `TranslationServiceClient` using the provided
 * options or the class's stored credentials, API key, or key file. It configures the client
 * with the necessary authentication details and sets the library version to 'v3'.
 *
 * The method prioritizes the options provided in the `opts` parameter over the class's stored
 * credentials, API key, or key file. If `opts` is not provided, it uses the class's stored
 * values.
 *
 * If the initialization is successful, the `_isTranslateReady` flag is set to `true`.
 * Otherwise, it's set to `false`.
 *
 * @private
 * @param {GoogleKeyOptions} [opts] - Optional configuration options for the Translation API client.
 * @param {string} [opts.apiKey] - Optional API key to use for authentication.
 * @param {string} [opts.keyFile] - Optional path to a service account key file.
 * @param {any} [opts.credentials] - Optional service account credentials.
 *
 * @example
 * ```typescript
 * // Initialize the Translation API client with a specific API key
 * this._initializeTranslateClient({ apiKey: 'your_api_key' });
 * ```
 */



  /**
   * Initializes the Google Cloud Translation API client.
   *
   * This method creates a new instance of the `TranslationServiceClient` using the provided options or the
   * class's stored credentials, API key, or key file. It configures the client with the necessary
   * authentication details and sets the library version to 'v3'.
   *
   * @param {GoogleKeyOptions} [opts] - Optional configuration options for the Translation API client.
   * @param {string} [opts.apiKey] - Optional API key to use for authentication.
   * @param {string} [opts.keyFile] - Optional path to a service account key file.
   * @param {any} [opts.credentials] - Optional service account credentials.
   *
   * @remarks
   * If the initialization is successful, the `_isTranslateReady` flag is set to `true`. Otherwise, it's set to `false`.
   *
   * @example
   * ```typescript
   * 
   * // Initialize the Translation API client with a specific API key
   * this._initializeTranslateClient({ apiKey: 'your_api_key' });
   * 
   * ```
   *
   * @private
   */
  private _initializeTranslateClient(opts?: GoogleKeyOptions) {
    try {
      this.translationClient = new TranslationServiceClient({
        credentials: opts?.credentials || this._credentials || undefined,
        apiKey: opts?.apiKey || this._apiKey || undefined,
        keyFile: opts?.keyFile || this._keyFile || undefined,
        libVersion: 'v3'
      });
      // console.log('translateClient object =>', this.translateClient)
      if (this.translationClient) this._isTranslateReady = true;
    } catch (error) {
      console.log('Error on initializeWithApiKey: ', error)
      this._isTranslateReady = false;
    }
  }

  /**
 * Displays the URL for Google authentication.
 *
 * This method logs instructions on how to authenticate with the Google Cloud services using the
 * provided Cloud Run base URL.
 *
 * The method logs a URL that the user must open in their browser to authenticate with their
 * Google account. After authenticating, the user will receive an access token that must be
 * copied and pasted into the prompt.
 *
 * The Cloud Run base URL is obtained from the environment variables `CLOUD_RUN_URL` or
 * `CLOUD_RUN_URL1`. If neither is set, it logs an error.
 *
 * @example
 * ```typescript
 * this.displayAuthUrl();
 * ```
 * @async
 */
  /**
   * Displays the URL for Google authentication.
   *
   * This method logs instructions on how to authenticate with the Google Cloud services using the
   * provided Cloud Run base URL.
   *
   * @remarks
   * The method logs a URL that the user must open in their browser to authenticate with their Google account.
   * After authenticating, the user will receive an access token that must be copied and pasted into the prompt.
   *
   * @example
   * ```typescript
   * 
   *    this.displayAuthUrl();
   * 
   * ```
   */
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

  private _isAuthenticationSuccess() {
    console.log(bgYellowBright(`    GOOGLE AUTHENTICATED  : `) + bgGreenBright(`SUCCESS`)); // Show a part of the token
  }

  private _isAuthenticationFailed() {
    console.log(bgYellowBright(` GOOGLE AUTHENTICATION     : ${bgRedBright(' FAILED ')}`));
  }


  /**
     * Sets the API key for Google API authentication.
     *
     * @param {string} apiKey - The Google API key.
     */
  setApiKey(apiKey?: string): void {
    this._apiKey = apiKey ? apiKey : process.env.GOOGLE_API_KEY;
  }

  /**
   * Sets the path to the service account key file for Google API authentication.
   *
   * @param {any} credentials - The path to the service account key file.
   */
  setCredentials(credentials?: any): void {
    this._credentials = credentials;
  }

  /**
  * Sets the path to the service account key file for Google API authentication.
  *
  * @param {string} keyFile - The path to the service account key file.
  */
  setkeyFile(keyFile?: string): void {
    this._keyFile = keyFile ? resolve(keyFile) : resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS as string);
  }

  /**
   * Sets the access token for Cloud Run authentication.
   *
   * @param {string} accessToken - The Cloud Run access token.
   */
  setAccessToken(accessToken: string): void {
    this._accessToken = accessToken;
  }

}
