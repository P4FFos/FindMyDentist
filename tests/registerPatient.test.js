const mqtt = require('mqtt');
const mongoose = require('mongoose');
const mqttUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const mongoUri = process.env.DATABASE_URL || "mongodb://localhost:27017/FindMyDentistTestDB"; 

// A function to wait (predicatbly) for services to start. 
// The test works the first time and then for some reason always starts ahead before service starts
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)); 

// Set up mongoDB
beforeAll(async () => {
  await sleep(1000);
  await mongoose.connect(mongoUri);
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}); 

describe('MQTT Controller', () => {
  let mqttClient;

  beforeAll(() => {
    mqttClient = mqtt.connect(mqttUrl);

    mqttClient.on('connect', () => {
      console.log(`Connected to MQTT broker at ${mqttUrl}`);
    });


  });

  afterAll(() => {
    mqttClient.end();
  });

  describe('handlePatientCreate', () => {
    it('should create a new patient and publish success response', async () => {
        const payload = {
          email: 'test@example.com',
          firstName: 'Stefan',
          secondName: 'Tram',
          phone: '0912834213',
          password: 'ILoveDistributedSystems',
        };

        mqttClient.subscribe('patients/create/response');
      
        
        const publishPromise = new Promise((resolve) => {
          mqttClient.once('message', (topic, message) => {
            if (topic === 'patients/create/response') {
              resolve(JSON.parse(message.toString()));
            }
          });
        });

        
        mqttClient.publish('patients/create', JSON.stringify(payload));
    
        
        const response = await publishPromise;
        
        expect(response.status).toBe('success');
        expect(response).toBeTruthy();

        
        const loginPayload = {
          email: payload.email,
          password: payload.password,
        };

        mqttClient.subscribe('patients/get/login/response');

        const loginPromise = new Promise((resolve) => {
          mqttClient.once('message', (topic, message) => {
            if (topic === 'patients/get/login/response') {
              resolve(JSON.parse(message.toString()));
            }
          });
        });

        mqttClient.publish('patients/get/login', JSON.stringify(loginPayload));

        const loginResponse = await loginPromise;

        expect(loginResponse.status).toBe('success');

        const retrievedPatient = loginResponse.patient;
        expect(retrievedPatient).toBeTruthy();

        // Verify the retrieved patient details match the created patient
        expect(retrievedPatient.email).toBe(payload.email);
        expect(retrievedPatient.firstName).toBe(payload.firstName);
        expect(retrievedPatient.secondName).toBe(payload.secondName);
        expect(retrievedPatient.phone).toBe(payload.phone);
    });
  });
});
