import { fakerID_ID } from '@faker-js/faker';



const faker = fakerID_ID;
/**
 * @type {Object} FakerCustom
 */
export type FakerCustom = {
  [key: string]: (...args: any[]) => any;
};

/**
 * Returns an object with the following functions as properties:
 *
 * - address: generates data for address
 * - guest: generates data for guest
 * - todo: generates data for to-do
 * - place: generates data for place
 * - article: generates data for article
 * - custom: generates data for custom schema
 *
 * @returns an object with functions as its properties
 */
export function createSchema() {
  const address = createAddress;
  const guest = createGuest;
  const todo = createTodo;
  const place = createPlace;
  const article = createArticle;
  const custom = createCustom;
  return {
    address,
    guest,
    todo,
    place,
    article,
    custom,
  }
}

/**
 * Generates a mock address object with various location details.
 *
 * This function utilizes the `faker` library to create realistic,
 * but randomly generated, address components. It's designed to
 * simulate address data for testing or development purposes.
 *
 * @returns An object containing address details such as building, street, village,
 * district, city, province, postal code, and country.
 *
 * @example
 * ```typescript
 * const address = createAddress();
 * ```
 */
export function createAddress() {
  return {
    building: faker.location.street(),
    street: faker.location.streetAddress(),
    village: faker.location.state() + faker.location.countryCode(),
    district: faker.location.county(),
    city: faker.location.city(),
    province: faker.location.state(),
    postalcode: faker.location.zipCode(),
    country: 'Indonesia',
  }
};

/**
 * Generates a mock guest object with various personal and event-related details.
 *
 * This function utilizes the `faker` library to create realistic,
 * but randomly generated, guest data for testing or development purposes.
 * The guest object includes identifiers, names, contact information, and 
 * event participation details.
 *
 * @returns An object containing guest details such as UUID, salutation, prefix, 
 * first and last name, suffix, event ID, gender, category, email, phone number, 
 * address, and the number of invitees.
 *
 * @example
 * ```typescript
 * const guest = createGuest();
 * ```
 */

export function createGuest() {
  return {
    uuid: faker.string.uuid(),
    salutation: faker.helpers.arrayElement(['bapak', 'ibu', 'saudara', 'saudari']),
    prefix: faker.helpers.arrayElement(['Ir.', 'DR', 'drs.', 'prof.', null]),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    suffix: faker.person.suffix(),
    event: faker.helpers.arrayElement(['-L6Q_cMVyOR0ol1rvCZg', '-L6Q_cMVyOR0ol1rvCZh', '-L6Q_cMVyOR0ol1rvCZi']),
    gender: faker.helpers.arrayElement(['female', 'male']),
    category: faker.helpers.arrayElement(['vip', 'friend', 'client', 'family']) || null,
    email: faker.internet.email().toLowerCase(),
    phone_number: faker.phone.number(),
    address: createAddress(),
    invitees: faker.number.int(5),
  }
};

/**
 * Generates a mock to-do object with various task-related details.
 *
 * This function utilizes the `faker` library to create realistic,
 * but randomly generated, to-do data for testing or development purposes.
 * The to-do object includes a title, description, date, time, handler, event,
 * priority level, and status.
 *
 * @returns An object containing to-do details such as title, description,
 * date, time of the task, assigned handler, event ID, priority, and status.
 *
 * @example
 * ```typescript
 * const todo = createTodo();
 * ```
 */

export function createTodo() {
  return {
    title: faker.lorem.sentence(3),
    description: faker.lorem.paragraphs(3, "\n \r"),
    date: new Date(faker.date.between({ from: '2018-02-27', to: '2018-03-14' })).getTime(),
    time: new Date(faker.date.between({ from: '2018-02-27', to: '2018-03-14' })).getTime(),
    handler: faker.helpers.arrayElement(['Nicky', 'Robin', 'Zackia']),
    event: faker.helpers.arrayElement(['-L6Q_cMVyOR0ol1rvCZg', '-L6Q_cMVyOR0ol1rvCZh', '-L6Q_cMVyOR0ol1rvCZi']),
    priority: faker.helpers.arrayElement(['urgent', 'normal', 'tentative']),
    status: faker.helpers.arrayElement(['done', 'pending', 'cancel'])
  }
};

/**
 * Generates a mock place object with various location and category details.
 *
 * This function utilizes the `faker` library to create realistic,
 * but randomly generated, place data for testing or development purposes.
 * The place object includes a category, name, area, and an address.
 *
 * @returns An object containing place details such as category, name,
 * area, and address.
 *
 * @example
 * ```typescript
 * const place = createPlace();
 * ```
 */

export function createPlace() {
  return {
    category: faker.helpers.arrayElement(['hotel', 'bistro', 'sport centre', 'restaurant', 'pool', 'multifunction']),
    name: faker.lorem.sentence(2),
    area: faker.lorem.word(),
    address: createAddress()
  }
};

/**
 * Generates a mock article object with various content and metadata details.
 *
 * This function utilizes the `faker` library to create realistic,
 * but randomly generated, article data for testing or development purposes.
 * The article object includes a title, category, content, likes, and author.
 *
 * @returns An object containing article details such as title, category,
 * content, number of likes, and author's full name.
 *
 * @example
 * ```typescript
 * const article = createArticle();
 * console.log(article);
 * // Expected output (example):
 * // { title: 'Voluptatem et ut.', category: 'Renungan Harian', content: 'Quia et et. \n \r Autem et et.', likes: 1234, author: 'Jayson Wintheiser' }
 * ```
 */

export function createArticle() {
  return {
    title: faker.lorem.sentence(),
    category: faker.helpers.arrayElement(['Lagu Rohani', 'Renungan Harian', 'Kotbah', 'Kesaksian', 'Inspirasi', 'Renungan']),
    content: faker.lorem.paragraphs(2, "\n \r"),
    likes: faker.number.int({ min: 5, max: 2550 }),
    author: faker.person.fullName(),
  }
};


/**
 * Creates a set of custom data generators using the Faker library.
 *
 * This function provides a collection of functions that can be used to generate
 * various types of mock data. Each property in the returned object is a function
 * from the Faker library, allowing for flexible and diverse data generation.
 *
 * @returns An object where each key is a descriptive name of a Faker function,
 *          and the value is the corresponding Faker function itself.
 *
 * @example
 * ```typescript
 * const customGenerators = createCustom();
 * const uuid = customGenerators['random.uuid()'](); // Generates a UUID
 * const fullName = customGenerators['name.findName()'](); // Generates a full name
 * const email = customGenerators['internet.email()'](); // Generates an email
 * ```
 */

export function createCustom(): FakerCustom {
  return {
    'random.uuid()': faker.string.uuid, // Generates a UUID
    'name.findName()': faker.person.fullName, // Generates a full name
    'internet.email()': faker.internet.email, // Generates an email
    'address.streetAddress()': faker.location.streetAddress, // Generates a street address
    'lorem.paragraph()': faker.lorem.paragraph, // Generates a paragraph of text
    'lorem.paragraphs()': faker.lorem.paragraphs, // Generates multiple paragraphs of text
    'date.past()': faker.date.past, // Generates a past date
    'finance.amount()': faker.finance.amount, // Generates a financial amount
    'image.imageUrl()': faker.image.url, // Generates an image URL
    'phone.phoneNumber()': faker.phone.number, // Generates a phone number
  };
};
