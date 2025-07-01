import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://luiz:luiz2610@simoldes.uuhrbxx.mongodb.net/?retryWrites=true&w=majority&appName=simoldes";
const client = new MongoClient(uri);

async function initializeDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('simoldes');

    // Create collections with validations
    await createMachinesCollection(db);
    await createProjectsCollection(db);
    await createOperationsCollection(db);
    await createOperatorsCollection(db);
    await createOperationLogsCollection(db);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
  }
}

async function createMachinesCollection(db) {
  try {
    await db.createCollection('machines', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['machineId', 'name', 'password', 'status'],
          properties: {
            machineId: { bsonType: 'string' },
            name: { bsonType: 'string' },
            password: { bsonType: 'string' },
            status: { 
              enum: ['active', 'maintenance', 'inactive'] 
            },
            lastLogin: { bsonType: 'date' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

    await db.collection('machines').createIndex(
      { machineId: 1 }, 
      { unique: true }
    );

    console.log('Machines collection created with validation and indexes');
  } catch (error) {
    if (error.code !== 48) { // Ignore "collection already exists" error
      console.error('Error creating machines collection:', error);
      throw error;
    }
  }
}

async function createProjectsCollection(db) {
  try {
    await db.createCollection('projects', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['projectId', 'name', 'machine', 'date'],
          properties: {
            projectId: { bsonType: 'string' },
            name: { bsonType: 'string' },
            machine: { bsonType: 'string' },
            programPath: { bsonType: 'string' },
            material: { bsonType: 'string' },
            date: { bsonType: 'date' },
            programmer: { bsonType: 'string' },
            blockCenter: { bsonType: 'string' },
            reference: { bsonType: 'string' },
            observations: { bsonType: 'string' },
            imageUrl: { bsonType: 'string' },
            status: { 
              enum: ['in_progress', 'completed'] 
            },
            completedDate: { bsonType: 'date' },
            totalTime: { bsonType: 'double' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

    // Create indexes
    await db.collection('projects').createIndex({ projectId: 1 }, { unique: true });
    await db.collection('projects').createIndex({ machine: 1 });
    await db.collection('projects').createIndex({ status: 1 });
    await db.collection('projects').createIndex({ date: 1 });

    console.log('Projects collection created with validation and indexes');
  } catch (error) {
    if (error.code !== 48) {
      console.error('Error creating projects collection:', error);
      throw error;
    }
  }
}

async function createOperationsCollection(db) {
  try {
    await db.createCollection('operations', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          properties: {
            projectId: { bsonType: 'objectId' },
            sequence: { bsonType: 'string' },
            type: { 
              bsonType: 'string' 
            },
            function: { bsonType: 'string' },
            centerPoint: { bsonType: 'string' },
            toolRef: { bsonType: 'string' },
            ic: { bsonType: 'string' },
            alt: { bsonType: 'string' },
            time: {
              bsonType: 'object',
              properties: {
                machine: { bsonType: 'string' },
                total: { bsonType: 'string' }
              }
            },
            details: {
              bsonType: 'object',
              properties: {
                depth: { bsonType: 'string' },
                speed: { bsonType: 'string' },
                feed: { bsonType: 'string' },
                coolant: { bsonType: 'string' },
                notes: { bsonType: 'string' }
              }
            },
            quality: {
              bsonType: 'object',
              properties: {
                tolerance: { bsonType: 'string' },
                surfaceFinish: { bsonType: 'string' },
                requirements: { 
                  bsonType: 'array',
                  items: { bsonType: 'string' }
                }
              }
            },
            imageUrl: { bsonType: 'string' },
            completed: { bsonType: 'bool' },
            signedBy: { bsonType: 'string' },
            timestamp: { bsonType: 'date' },
            inspectionNotes: { bsonType: 'string' },
            timeRecord: {
              bsonType: 'object',
              properties: {
                start: { bsonType: 'date' },
                end: { bsonType: 'date' }
              }
            },
            measurementValue: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

    // Create indexes
    await db.collection('operations').createIndex({ projectId: 1 });
    await db.collection('operations').createIndex({ sequence: 1 });
    await db.collection('operations').createIndex({ completed: 1 });
    await db.collection('operations').createIndex({ signedBy: 1 });

    console.log('Operations collection created with validation and indexes');
  } catch (error) {
    if (error.code !== 48) {
      console.error('Error creating operations collection:', error);
      throw error;
    }
  }
}

async function createOperatorsCollection(db) {
  try {
    await db.createCollection('operators', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'code', 'role'],
          properties: {
            name: { bsonType: 'string' },
            code: { bsonType: 'string' },
            role: { 
              enum: ['operator', 'supervisor', 'admin'] 
            },
            active: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });

    await db.collection('operators').createIndex(
      { code: 1 }, 
      { unique: true }
    );

    console.log('Operators collection created with validation and indexes');
  } catch (error) {
    if (error.code !== 48) {
      console.error('Error creating operators collection:', error);
      throw error;
    }
  }
}

async function createOperationLogsCollection(db) {
  try {
    await db.createCollection('operationLogs', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['operationId', 'projectId', 'machineId', 'type'],
          properties: {
            operationId: { bsonType: 'objectId' },
            projectId: { bsonType: 'objectId' },
            machineId: { bsonType: 'string' },
            operatorId: { bsonType: 'objectId' },
            type: { 
              enum: ['start', 'complete', 'measurement', 'note'] 
            },
            value: { bsonType: 'string' },
            timestamp: { bsonType: 'date' },
            createdAt: { bsonType: 'date' }
          }
        }
      }
    });

    // Create indexes
    await db.collection('operationLogs').createIndex({ operationId: 1 });
    await db.collection('operationLogs').createIndex({ projectId: 1 });
    await db.collection('operationLogs').createIndex({ timestamp: 1 });

    console.log('OperationLogs collection created with validation and indexes');
  } catch (error) {
    if (error.code !== 48) {
      console.error('Error creating operationLogs collection:', error);
      throw error;
    }
  }
}

// Run the initialization
initializeDatabase().catch(console.error); 