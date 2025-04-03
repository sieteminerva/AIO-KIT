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
export var IRole;
(function (IRole) {
    IRole["ADMIN"] = "ADMIN";
    IRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    IRole["STAFF"] = "STAFF";
    IRole["GUEST"] = "GUEST";
})(IRole || (IRole = {}));
export var PAPERWORKS;
(function (PAPERWORKS) {
    PAPERWORKS["LEGAL_MEMO"] = "LEGAL_MEMO";
    PAPERWORKS["LETTER_OF_ADVICE"] = "LETTER_OF_ADVICE";
    PAPERWORKS["LEGAL_RESEARCH"] = "LEGAL_RESEARCH";
})(PAPERWORKS || (PAPERWORKS = {}));
export var LEGAL_CATEGORY;
(function (LEGAL_CATEGORY) {
    LEGAL_CATEGORY["PIDANA"] = "PIDANA";
    LEGAL_CATEGORY["PERDATA"] = "PERDATA";
    LEGAL_CATEGORY["ARBITRASE"] = "ARBITRASE";
    LEGAL_CATEGORY["CORPORATE"] = "CORPORATE";
})(LEGAL_CATEGORY || (LEGAL_CATEGORY = {}));
function generateRandomArray(min, max, contentGenerator) {
    const container = Array.from({ length: faker.number.int({ min, max, }) });
    return container.map((item) => {
        item = contentGenerator();
        return item;
    });
}
function createAttendee() {
    return {
        key: generateId(),
        name: faker.person.fullName(),
        jobtitle: faker.person.jobTitle(),
        company: faker.company.name(),
        presence: faker.helpers.arrayElement([true, false])
    };
}
function createMeetingText() {
    return {
        key: generateId(),
        text: faker.lorem.lines(3)
    };
}
function createMeetingTasks(attendees) {
    return attendees.map(attendee => {
        const item = {
            key: generateId(),
            date: faker.date.recent({ days: 30 }),
            attendee: attendee.name,
            task: faker.company.catchPhrase()
        };
        return item;
    });
}
function createAbbreviation(name) {
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
        `${prefix} ${name} ${suffix}`
    ]);
    return {
        name, prefix, suffix, full
    };
}
export function createClient() {
    const companyName = buildCompanyName();
    return {
        name: companyName.full,
        address: `${faker.location.secondaryAddress()}, ${faker.location.streetAddress()}. ${faker.location.city()} - ${faker.location.state()}, Indonesia ${faker.location.zipCode()}`,
        since: new Date(faker.date.past({ years: 1 })).toDateString(),
        abbr: createAbbreviation(companyName.name)
    };
}
export function createUserProfile() {
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
function generateRandomUser(min, max, useTimestamp) {
    const container = Array.from({
        length: faker.number.int({
            min,
            max,
        }),
    });
    return container.map((item) => {
        const persons = toReadFileSync('./userProfile.json');
        item = faker.helpers.arrayElement(persons);
        if (useTimestamp) {
            item.timestamp = new Date(faker.date.recent({ days: 30 })).toDateString();
        }
        return item;
    });
}
function createMetadata() {
    const updated = generateRandomUser(1, 4, true);
    return {
        created: generateRandomUser(1, 1, true)[0],
        updated,
        lastUpdated: updated[updated.length - 1].timestamp
    };
}
function createAttachment() {
    const fullPath = faker.image.avatar();
    const filename = fullPath.substring(fullPath.lastIndexOf('/') + 1);
    return {
        filename,
        url: fullPath,
        extension: faker.system.fileExt('image'),
        key: generateId()
    };
}
function generateAttachments(min, max, useTimestamp) {
    const container = Array.from({
        length: Number(faker.number.binary({ min, max, })),
    });
    return container.map((item) => {
        item = createAttachment();
        return item;
    });
}
function getRandomClientAbbr() {
    const clients = toReadFileSync('./client.json');
    return faker.helpers.arrayElement(clients).abbr;
}
export function createMatter() {
    const personel = generateRandomUser(1, 4);
    const estDate = new Date(faker.date.recent({ days: 12 })).toDateString();
    return {
        status: faker.helpers.arrayElement(['Pitch', 'Running']),
        category: faker.helpers.arrayElement([LEGAL_CATEGORY.ARBITRASE, LEGAL_CATEGORY.CORPORATE, LEGAL_CATEGORY.PIDANA, LEGAL_CATEGORY.PIDANA]),
        clientId: getRandomClientAbbr(),
        projectNo: Number(faker.number.binary({ min: 1, max: 25 })),
        city: faker.location.city(),
        country: faker.helpers.arrayElement(['Indonesia', 'Malaysia']),
        workPhase: undefined,
        estDate,
        endDate: new Date(faker.date.future({ years: 1, refDate: estDate })).toDateString(),
        personInCharge: faker.helpers.arrayElement(personel),
        handlers: faker.helpers.arrayElement(personel),
        teams: personel,
        metadata: createMetadata(),
    };
}
function getRandomMatterNumber() {
    const matters = toReadFileSync('./matter.json')
        .map((matter) => {
        const matterNumber = `${matter.category.substring(0, 3)}/${matter.clientId.toUpperCase()}/${matter.projectNo}/${new Date(matter.endDate).getFullYear()}`;
        return matterNumber;
    });
    return faker.helpers.arrayElement(matters);
}
export function createCircular() {
    return {
        division: faker.helpers.arrayElement(['FINANCE', 'HRD']),
        number: Number(faker.number.binary({ min: 1, max: 25 })),
        idn: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
        recepient: generateRandomUser(1, 1),
        subject: faker.lorem.lines(1),
        description: faker.lorem.paragraph(5),
        closingText: faker.lorem.lines(2),
        metadata: createMetadata(),
    };
}
export function createMemo() {
    return {
        recepient: generateRandomUser(1, 1),
        subject: faker.lorem.lines(1),
        description: faker.lorem.paragraph(5),
        attachment: generateAttachments(1, 4),
        metadata: createMetadata(),
    };
}
function setTime(dateFormat, changeIt) {
    const newDate = new Date(dateFormat.getFullYear(), dateFormat.getMonth(), dateFormat.getDate(), changeIt ? faker.helpers.arrayElement([9, 10, 11, 14, 15, 16, 19]) : 0, changeIt ? faker.helpers.arrayElement([0, 15, 30]) : 0);
    return newDate;
}
export function createMinutes() {
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
}
;
export function createPaperwork() {
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
export function createProgressReport() {
    const matter = getRandomMatterNumber();
    return {
        matter,
        category: faker.helpers.arrayElement([LEGAL_CATEGORY.ARBITRASE, LEGAL_CATEGORY.CORPORATE, LEGAL_CATEGORY.PIDANA, LEGAL_CATEGORY.PIDANA]),
        clientId: matter.split('/')[1],
        metadata: createMetadata(),
    };
}
export function createAnalysisAndEvaluation() {
    return {
        matter: getRandomMatterNumber(),
        description: faker.lorem.paragraph(5),
        closingText: faker.lorem.lines(2),
        metadata: createMetadata(),
    };
}
function getMatters() {
    return toReadFileSync('./matter.json')
        .map((response) => {
        const key = response.key;
        const matter = `${response.category.substring(0, 3)}/${response.clientId.toUpperCase()}/${response.projectNo}/${new Date(response.endDate).getFullYear()}`;
        return {
            key,
            matter,
            status: response.status,
            workPhase: response.workPhase,
            estDate: response.estDate,
            endDate: response.endDate,
            created: response.metadata.created
        };
    });
}
function getItemByMatterNumber(path, matter) {
    const items = toReadFileSync(`./${path}.json`)
        .filter((res) => {
        res.type = path;
        return res.matter === matter;
    });
    return items;
}
export function createSummary() {
    const summaries = getMatters().map((res) => {
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
    };
}
