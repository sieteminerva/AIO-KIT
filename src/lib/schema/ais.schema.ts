import { faker } from '@faker-js/faker';
import { generateId, toReadFileSync } from '../scripts/util.js';



export function createAisScema() {
  const matter = createMatter;
  const circular = createCircular;
  const memo = createMemo;
  const minutes = createMinutes;
  const paperwork = createPaperwork;
  const progressReport = createProgressReport;
  const analysisAndEvaluation = createAnalysisAndEvaluation;
  const summary = createSummary;
  const timeManager = createTimeManager;

  return {
    matter, circular, memo,
    minutes, paperwork, timeManager,
    progressReport, summary,
    analysisAndEvaluation,
  };
}

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

export enum IRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  STAFF = 'STAFF',
  GUEST = 'GUEST'
}

export enum PAPERWORKS {
  LEGAL_MEMO = 'LEGAL_MEMO',
  LETTER_OF_ADVICE = 'LETTER_OF_ADVICE',
  LEGAL_RESEARCH = 'LEGAL_RESEARCH'
}

export enum LEGAL_CATEGORY {
  PIDANA = 'PIDANA',
  PERDATA = 'PERDATA',
  ARBITRASE = 'ARBITRASE',
  CORPORATE = 'CORPORATE'
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

function generateRandomArray(min: number, max: number, contentGenerator: () => any | any[]): any[] {
  const container = Array.from({ length: faker.number.int({ min, max, }) })
  return container.map((item: any) => {
    item = contentGenerator();
    return item;
  });
}

function createAttendee(): IMeetingAttendee {
  return {
    key: generateId(),
    name: faker.person.fullName(),
    jobtitle: faker.person.jobTitle(),
    company: faker.company.name(),
    presence: faker.helpers.arrayElement([true, false])
  }
}

export interface IMeetingText {
  key: string;
  text: string;
}

function createMeetingText(): IMeetingText {
  return {
    key: generateId(),
    text: faker.lorem.lines(3)
  }
}

export interface IMeetingTask {
  key: string;
  date: number | Date;
  attendee: IMeetingAttendee;
  task: string;
}

function createMeetingTasks(attendees: IMeetingAttendee[]): IMeetingTask[] {
  return attendees.map(attendee => {
    const item = {
      key: generateId(),
      date: faker.date.recent({ days: 30 }),
      attendee: attendee.name,
      task: faker.company.catchPhrase()
    }
    return item as IMeetingTask;
  })
}

export interface IClientContact {
  key?: string;
  name?: string;
  address?: string;
  since?: Date | number | string;
  abbr?: string;
}

function createAbbreviation(name: string): string {
  return name
    .replace(' and ', ' ')
    .split(/\s/)
    .reduce((accumulator, word) => accumulator + word.charAt(0), '')
    .replace('(', '').replace('-', '').replace(' ', '')
    .toUpperCase();
}

function buildCompanyName() {
  const name = faker.company.name().replace(' (Persero) Tbk', '').replace(' Tbk', '');
  const prefix = faker.helpers.arrayElement(['PT.', 'CV.', 'Yayasan', 'Bank']);
  const suffix = faker.helpers.arrayElement(['(Persero) Tbk.', 'Inc', 'Design', 'Group', 'Trading', 'LLC']);
  const full = faker.helpers.arrayElement([
    `${prefix} ${name}`,
    `${name} ${suffix}`,
    `${prefix} ${name} ${suffix}`]);
  return {
    name, prefix, suffix, full
  }
}

export function createClient(): IClientContact {
  const companyName = buildCompanyName();
  return {
    name: companyName.full,
    address: `${faker.location.secondaryAddress()}, ${faker.location.streetAddress()}. ${faker.location.city()} - ${faker.location.state()}, Indonesia ${faker.location.zipCode()}`,
    since: new Date(faker.date.past({ years: 1 })).toDateString(),
    abbr: createAbbreviation(companyName.name)
  };
}

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

/* USER PROFILE SCHEMA */
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
export function createUserProfile(): IUserProfile {
  return {
    uid: faker.string.uuid(),
    roles: faker.helpers.arrayElement([IRole.ADMIN, IRole.STAFF, IRole.SUPER_ADMIN]),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    jobtitle: faker.person.jobTitle(),
    imageURL: faker.image.avatar(),
    userAgent: faker.internet.userAgent()
  };
}

function generateRandomUser(min: number, max: number, useTimestamp?: boolean): IUserCreator[] {
  const container = Array.from({
    length: faker.number.int({
      min,
      max,
    }),
  })
  return container.map((item: any) => {
    const persons = toReadFileSync('./userProfile.json');
    item = faker.helpers.arrayElement(persons);
    if (useTimestamp) {
      item.timestamp = new Date(faker.date.recent({ days: 30 })).toDateString();
    }
    return item as IUserCreator;
  });
}

function createMetadata(): IMetadataCreation {
  const updated = generateRandomUser(1, 4, true);
  return {
    created: generateRandomUser(1, 1, true)[0],
    updated,
    lastUpdated: updated[updated.length - 1].timestamp
  }
}

function createAttachment(): IFileAttachment {
  const fullPath = faker.image.avatar();
  const filename = fullPath.substring(fullPath.lastIndexOf('/') + 1);

  return {
    filename,
    url: fullPath,
    extension: faker.system.fileExt('image'),
    key: generateId()
  }
}

function generateAttachments(min: number, max: number, useTimestamp?: boolean): IFileAttachment[] {
  const container = Array.from({
    length: Number(faker.number.binary({ min, max, })),
  })
  return container.map((item: any) => {
    item = createAttachment()
    return item;
  });
}



/* MATTER SCHEMA */
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

function getRandomClientAbbr(): string {
  const clients: IClientContact[] = toReadFileSync('./client.json');
  return faker.helpers.arrayElement(clients).abbr as string;
}

export function createMatter(): IMatter {
  const personel = generateRandomUser(1, 4);
  const estDate = new Date(faker.date.recent({ days: 12 })).toDateString();
  return {
    status: faker.helpers.arrayElement(['Pitch', 'Running']) as 'Pitch' | 'Running',
    category: faker.helpers.arrayElement([LEGAL_CATEGORY.ARBITRASE, LEGAL_CATEGORY.CORPORATE, LEGAL_CATEGORY.PIDANA, LEGAL_CATEGORY.PIDANA]),
    clientId: getRandomClientAbbr(),
    projectNo: Number(faker.number.binary({ min: 1, max: 25 })),
    city: faker.location.city(),
    country: faker.helpers.arrayElement(['Indonesia', 'Malaysia']),
    workPhase: undefined,
    estDate,
    endDate: new Date(faker.date.future({ years: 1, refDate: estDate })).toDateString(),
    personInCharge: faker.helpers.arrayElement(personel) as IUserCreator[],
    handlers: faker.helpers.arrayElement(personel) as IUserCreator[],
    teams: personel,
    metadata: createMetadata(),
  }
}


function getRandomMatterNumber(): string {
  const matters: any[] = toReadFileSync('./matter.json')
    .map((matter: IMatter) => {
      const matterNumber = `${(matter.category as string).substring(0, 3)}/${(matter.clientId as string).toUpperCase()}/${matter.projectNo}/${new Date(matter.endDate as string).getFullYear()}`;
      return matterNumber;
    });
  return faker.helpers.arrayElement(matters);
}

/* CIRCULAR SCHEMA */
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
export function createCircular(): ICircular {
  return {
    division: faker.helpers.arrayElement(['FINANCE', 'HRD']) as 'FINANCE' | 'HRD',
    number: Number(faker.number.binary({ min: 1, max: 25 })),
    idn: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
    recepient: generateRandomUser(1, 1),
    subject: faker.lorem.lines(1),
    description: faker.lorem.paragraph(5),
    closingText: faker.lorem.lines(2),
    metadata: createMetadata(),
  }
}

/* MEMO SCHEMA */
export interface IMemo {
  key?: string;
  recepient?: IUserCreator[];
  subject?: string;
  description?: string;
  attachment?: IFileAttachment[];
  metadata?: IMetadataCreation;
}
export function createMemo(): IMemo {
  return {
    recepient: generateRandomUser(1, 1),
    subject: faker.lorem.lines(1),
    description: faker.lorem.paragraph(5),
    attachment: generateAttachments(1, 4),
    metadata: createMetadata(),
  }
}

/* MINUTES SCHEMA */
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

function setTime(dateFormat: Date, changeIt: boolean) {
  const newDate = new Date(
    dateFormat.getFullYear(),
    dateFormat.getMonth(),
    dateFormat.getDate(),
    changeIt ? faker.helpers.arrayElement([9, 10, 11, 14, 15, 16, 19]) : 0,
    changeIt ? faker.helpers.arrayElement([0, 15, 30]) : 0);
  return newDate;
}

export function createMinutes(): IMinutes {
  const mDate = new Date(faker.date.recent({ days: 30 }));
  const scheduledTime = setTime(mDate, true);
  const attendees = generateRandomArray(1, 4, createAttendee);
  return {
    matter: getRandomMatterNumber(),
    category: faker.helpers.arrayElement([LEGAL_CATEGORY.ARBITRASE, LEGAL_CATEGORY.CORPORATE, LEGAL_CATEGORY.PIDANA, LEGAL_CATEGORY.PIDANA]),
    date: mDate.toDateString(),
    place: faker.address.streetAddress(),
    building: faker.address.secondaryAddress(),
    scheduledTime,
    actualTime: setTime(scheduledTime, faker.helpers.arrayElement([true, false])),
    attendees,
    agendas: generateRandomArray(1, 5, createMeetingText),
    tasks: createMeetingTasks(attendees),
    summaries: generateRandomArray(1, 5, createMeetingText),
    metadata: createMetadata(),
  };
};

/* PAPERWORK SCHEMA */
export interface IPaperworks {
  key?: string;
  type?: PAPERWORKS;
  matter?: string;
  registrationCode?: string;
  title?: string;
  attachment?: IFileAttachment[];
  metadata?: IMetadataCreation;
}
export function createPaperwork(): IPaperworks {
  const matter = getRandomMatterNumber();
  return {
    type: faker.helpers.arrayElement([PAPERWORKS.LEGAL_MEMO, PAPERWORKS.LEGAL_RESEARCH, PAPERWORKS.LETTER_OF_ADVICE]),
    matter,
    registrationCode: `AP-${matter.split('/')[1]}/${faker.number.binary({ min: 1000, max: 9999 }).toString()}`,
    title: faker.lorem.lines(1),
    attachment: generateAttachments(1, 4),
    metadata: createMetadata(),
  };
}

/* PROGRESS REPORT SCHEMA */
export interface IProgressReport {
  key?: string;
  matter?: string;
  category?: LEGAL_CATEGORY | string;
  clientId?: string;
  metadata?: IMetadataCreation;
}
export function createProgressReport(): IProgressReport {
  const matter = getRandomMatterNumber();
  return {
    matter,
    category: faker.helpers.arrayElement([LEGAL_CATEGORY.ARBITRASE, LEGAL_CATEGORY.CORPORATE, LEGAL_CATEGORY.PIDANA, LEGAL_CATEGORY.PIDANA]),
    clientId: matter.split('/')[1],
    metadata: createMetadata(),
  };
}

/* ANALYSIS AND EVALUATION SCHEMA */
export interface IAnalysisAndEvaluation {
  key?: string;
  matter?: string;
  description?: string;
  closingText?: string;
  metadata?: IMetadataCreation;
}
export function createAnalysisAndEvaluation(): IAnalysisAndEvaluation {
  return {
    matter: getRandomMatterNumber(),
    description: faker.lorem.paragraph(5),
    closingText: faker.lorem.lines(2),
    metadata: createMetadata(),
  };
}

/* MATTER SUMMARY SCHEMA */
export interface IMatterSummary {
  key: string;
  matter: string;
  status?: 'Pitch' | 'Running';
  workPhase?: string;
  estDate?: number | string;
  endDate?: number | string;
  created?: IMetadataCreation
  contents: any[];
}

function getMatters(): string[] {
  return toReadFileSync('./matter.json')
    .map((response: IMatter) => {
      const key = response.key;
      const matter = `${(response.category as string).substring(0, 3)}/${(response.clientId as string).toUpperCase()}/${response.projectNo}/${new Date(response.endDate as string).getFullYear()}`;
      return {
        key,
        matter,
        status: response.status,
        workPhase: response.workPhase,
        estDate: response.estDate,
        endDate: response.endDate,
        created: (response.metadata as IMetadataCreation).created
      };
    });
}

function getItemByMatterNumber(path: string, matter: string): any[] {
  const items: any[] = toReadFileSync(`./${path}.json`)
    .filter((res: any) => {
      res.type = path;
      return res.matter === matter;
    })

  return items;
}

export function createSummary() {
  const summaries = getMatters().map((res: any) => {

    const circular = getItemByMatterNumber('circular', res.matter);
    const memo = getItemByMatterNumber('memo', res.matter);
    const minutes = getItemByMatterNumber('minutes', res.matter);
    const paperworks = getItemByMatterNumber('paperworks', res.matter);
    const progressReport = getItemByMatterNumber('progressReport', res.matter);
    const analysisAndEvaluation = getItemByMatterNumber('analysisAndEvaluation', res.matter);

    const contents = [...circular, ...memo, ...minutes, ...paperworks, ...progressReport, ...analysisAndEvaluation];

    return { ...res, contents };
  });

  return summaries;
}

export interface ITimeManager {
  key: string;
  matter: string;
  date: Date;
  duration: number;
  metadata?: IMetadataCreation;
}
export function createTimeManager() {
  return {
    matter: getRandomMatterNumber(),
    date: new Date(faker.date.recent({ days: 30 })).toDateString(),
    duration: {
      hours: faker.number.binary({ min: 1, max: 8 }),
      minutes: faker.number.binary({ min: 1, max: 59 }),
      seconds: faker.number.binary({ min: 1, max: 59 }),
    },
    metadata: createMetadata()
  }
}


