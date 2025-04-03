export declare function createAisScema(): {
    matter: typeof createMatter;
    circular: typeof createCircular;
    memo: typeof createMemo;
    minutes: typeof createMinutes;
    paperwork: typeof createPaperwork;
    timeManager: typeof createTimeManager;
    progressReport: typeof createProgressReport;
    summary: typeof createSummary;
    analysisAndEvaluation: typeof createAnalysisAndEvaluation;
};
export interface IFileAttachment {
    filename: string;
    key: string;
    url: string;
    extension: string;
}
export interface IMetadataCreation {
    created?: IUserCreator;
    updated?: IUserCreator[];
    lastUpdated?: number | Date | string;
}
export declare enum IRole {
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
    STAFF = "STAFF",
    GUEST = "GUEST"
}
export declare enum PAPERWORKS {
    LEGAL_MEMO = "LEGAL_MEMO",
    LETTER_OF_ADVICE = "LETTER_OF_ADVICE",
    LEGAL_RESEARCH = "LEGAL_RESEARCH"
}
export declare enum LEGAL_CATEGORY {
    PIDANA = "PIDANA",
    PERDATA = "PERDATA",
    ARBITRASE = "ARBITRASE",
    CORPORATE = "CORPORATE"
}
export interface IUserCreator {
    key?: string;
    uid?: string;
    roles?: IRole;
    firstname?: string;
    lastname?: string;
    jobtitle?: string;
    imageURL?: string;
    userAgent?: string;
    timestamp?: number | Date;
}
export interface IMeetingAttendee {
    key?: string;
    name?: string;
    jobtitle?: string;
    company?: string;
    presence?: string | boolean;
}
export interface IMeetingText {
    key: string;
    text: string;
}
export interface IMeetingTask {
    key: string;
    date: number | Date;
    attendee: IMeetingAttendee;
    task: string;
}
export interface IClientContact {
    key?: string;
    name?: string;
    address?: string;
    since?: Date | number | string;
    abbr?: string;
}
export declare function createClient(): IClientContact;
export interface ILegalMemo {
    key: string;
    matter: string;
    registrationCode: string;
    title: string;
    attachment: IFileAttachment;
}
export interface ILetterOfAdvice {
    key: string;
    matter: string;
    registrationCode: string;
    title: string;
    attachment: IFileAttachment;
}
export interface IUserProfile {
    uid?: string;
    imageURL?: string;
    roles?: IRole;
    firstname?: string;
    middlename?: string;
    lastname?: string;
    jobtitle?: string;
    startWorking?: number | Date;
    gender?: 'male' | 'female';
    birthPlace?: string;
    birthday?: number | Date;
    email?: string;
    phoneNumber?: number;
    NIK?: number;
    bloodType?: 'A' | 'B' | 'AB' | 'O';
    emergencyContact?: string;
    userAgent?: string;
}
export declare function createUserProfile(): IUserProfile;
export interface IMatter {
    key?: string;
    index?: number;
    status?: 'Pitch' | 'Running';
    category?: LEGAL_CATEGORY;
    clientId?: string;
    projectNo?: number;
    city?: string;
    country?: string;
    workPhase?: string;
    estDate?: number | string;
    endDate?: number | string;
    personInCharge?: any[];
    handlers?: any[];
    teams?: any[];
    metadata?: IMetadataCreation;
}
export declare function createMatter(): IMatter;
export interface ICircular {
    key?: string;
    division?: 'FINANCE' | 'HRD';
    number?: number;
    idn?: number;
    recepient?: IUserCreator[];
    subject?: string;
    description?: string;
    closingText?: string;
    metadata?: IMetadataCreation;
}
export declare function createCircular(): ICircular;
export interface IMemo {
    key?: string;
    recepient?: IUserCreator[];
    subject?: string;
    description?: string;
    attachment?: IFileAttachment[];
    metadata?: IMetadataCreation;
}
export declare function createMemo(): IMemo;
export interface IMinutes {
    key?: string;
    matter?: string;
    category?: LEGAL_CATEGORY | string;
    date?: number | Date | string;
    place?: string;
    building?: string;
    scheduledTime?: number | Date | string;
    actualTime?: number | Date | string;
    attendees?: IMeetingAttendee[];
    agendas?: IMeetingText[];
    tasks?: IMeetingTask[];
    summaries?: IMeetingText[];
    metadata?: IMetadataCreation;
}
export declare function createMinutes(): IMinutes;
export interface IPaperworks {
    key?: string;
    type?: PAPERWORKS;
    matter?: string;
    registrationCode?: string;
    title?: string;
    attachment?: IFileAttachment[];
    metadata?: IMetadataCreation;
}
export declare function createPaperwork(): IPaperworks;
export interface IProgressReport {
    key?: string;
    matter?: string;
    category?: LEGAL_CATEGORY | string;
    clientId?: string;
    metadata?: IMetadataCreation;
}
export declare function createProgressReport(): IProgressReport;
export interface IAnalysisAndEvaluation {
    key?: string;
    matter?: string;
    description?: string;
    closingText?: string;
    metadata?: IMetadataCreation;
}
export declare function createAnalysisAndEvaluation(): IAnalysisAndEvaluation;
export interface IMatterSummary {
    key: string;
    matter: string;
    status?: 'Pitch' | 'Running';
    workPhase?: string;
    estDate?: number | string;
    endDate?: number | string;
    created?: IMetadataCreation;
    contents: any[];
}
export declare function createSummary(): any[];
export interface ITimeManager {
    key: string;
    matter: string;
    date: Date;
    duration: number;
    metadata?: IMetadataCreation;
}
export declare function createTimeManager(): {
    matter: string;
    date: string;
    duration: {
        hours: string;
        minutes: string;
        seconds: string;
    };
    metadata: IMetadataCreation;
};
