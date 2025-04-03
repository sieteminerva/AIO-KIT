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
export declare function createSchema(): {
    address: typeof createAddress;
    guest: typeof createGuest;
    todo: typeof createTodo;
    place: typeof createPlace;
    article: typeof createArticle;
    custom: typeof createCustom;
};
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
export declare function createAddress(): {
    building: string;
    street: string;
    village: string;
    district: string;
    city: string;
    province: string;
    postalcode: string;
    country: string;
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
export declare function createGuest(): {
    uuid: string;
    salutation: "bapak" | "ibu" | "saudara" | "saudari";
    prefix: "Ir." | "DR" | "drs." | "prof." | null;
    firstname: string;
    lastname: string;
    suffix: string;
    event: "-L6Q_cMVyOR0ol1rvCZg" | "-L6Q_cMVyOR0ol1rvCZh" | "-L6Q_cMVyOR0ol1rvCZi";
    gender: "male" | "female";
    category: "vip" | "friend" | "client" | "family";
    email: string;
    phone_number: string;
    address: {
        building: string;
        street: string;
        village: string;
        district: string;
        city: string;
        province: string;
        postalcode: string;
        country: string;
    };
    invitees: number;
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
export declare function createTodo(): {
    title: string;
    description: string;
    date: number;
    time: number;
    handler: "Nicky" | "Robin" | "Zackia";
    event: "-L6Q_cMVyOR0ol1rvCZg" | "-L6Q_cMVyOR0ol1rvCZh" | "-L6Q_cMVyOR0ol1rvCZi";
    priority: "urgent" | "normal" | "tentative";
    status: "done" | "pending" | "cancel";
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
export declare function createPlace(): {
    category: "hotel" | "bistro" | "sport centre" | "restaurant" | "pool" | "multifunction";
    name: string;
    area: string;
    address: {
        building: string;
        street: string;
        village: string;
        district: string;
        city: string;
        province: string;
        postalcode: string;
        country: string;
    };
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
export declare function createArticle(): {
    title: string;
    category: "Lagu Rohani" | "Renungan Harian" | "Kotbah" | "Kesaksian" | "Inspirasi" | "Renungan";
    content: string;
    likes: number;
    author: string;
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
export declare function createCustom(): FakerCustom;
