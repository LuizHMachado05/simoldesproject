declare module 'mongodb' {
  export interface MongoClientOptions {
    serverApi?: {
      version: string;
      strict?: boolean;
      deprecationErrors?: boolean;
    };
  }

  export class MongoClient {
    constructor(uri: string, options?: MongoClientOptions);
    connect(): Promise<MongoClient>;
    close(): Promise<void>;
    db(name?: string): Db;
  }

  export class Db {
    command(command: object): Promise<any>;
    collection(name: string): Collection;
  }

  export class Collection {
    find(query?: object): Cursor;
    findOne(query?: object): Promise<any>;
    insertOne(doc: object): Promise<any>;
    insertMany(docs: object[]): Promise<any>;
    updateOne(filter: object, update: object): Promise<any>;
    updateMany(filter: object, update: object): Promise<any>;
    deleteOne(filter: object): Promise<any>;
    deleteMany(filter: object): Promise<any>;
  }

  export class Cursor {
    toArray(): Promise<any[]>;
  }
}
