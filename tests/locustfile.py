from locust import HttpUser, task, between, events
import paho.mqtt.client as mqtt
import json
import random
import time

# MQTT settings
BROKER = "localhost"
PORT = 1883
KEEP_ALIVE_INTERVAL = 60

# MQTT Topics
PATIENT_CREATE_TOPIC = "patients/create"
PATIENT_CREATE_RESPONSE_TOPIC = "patients/create/response"
DENTISTS_GET_ALL_TOPIC = "dentists/get/all"
DENTISTS_GET_ALL_RESPONSE_TOPIC = "dentists/get/all/response"
TIMESLOTS_GET_AVAILABLE_TOPIC = "timeslots/get/available"
TIMESLOTS_GET_AVAILABLE_RESPONSE_TOPIC = "timeslots/get/available/response"
APPOINTMENTS_CREATE_TOPIC = "appointments/create"
APPOINTMENTS_CREATE_RESPONSE_TOPIC = "appointments/create/response"

class RegisterUser(HttpUser):
    wait_time = between(1, 5)


    def __init__(self, environment):
        super().__init__(environment)
        self.patients_list = []
        self.dentists_list = []
        self.response_received = False
        self.response_data = None
        self.client = None

    def on_start(self):
        """Set up the MQTT client when a user starts."""
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(BROKER, PORT, KEEP_ALIVE_INTERVAL)
        self.client.loop_start()
        self.response_received = False
        self.response_data = None

        self.register_patient()

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker")
            client.subscribe(PATIENT_CREATE_RESPONSE_TOPIC)
            client.subscribe(DENTISTS_GET_ALL_RESPONSE_TOPIC)
            client.subscribe(TIMESLOTS_GET_AVAILABLE_RESPONSE_TOPIC)
            client.subscribe(APPOINTMENTS_CREATE_RESPONSE_TOPIC)
        else:
            print(f"Failed to connect to MQTT broker: {rc}")

    def on_message(self, client, userdata, message):
        """Handle responses from the MQTT broker."""
        try:
            response = json.loads(message.payload.decode("utf-8"))
            self.response_data = response
            self.response_received = True
            print(f"Received response: {response}")
        except Exception as e:
            print(f"Error decoding response: {e}")

    def on_stop(self):
        """Clean up when a user stops."""
        self.client.loop_stop()

    @task(1)
    def register_patient(self):
        """Simulate a patient registration."""
        patient_data = {
            "firstName": f"John{random.randint(1, 1000)}",
            "secondName": f"Doe{random.randint(1, 1000)}",
            "email": f"patient{random.randint(1, 100000000)}@example.com",
            "password": "password123",
            "phone": f"123-456-{random.randint(1000, 9999)}"
        }

        start_time = time.time()
        self.response_received = False
        self.client.publish(PATIENT_CREATE_TOPIC, json.dumps(patient_data))
        print(f"Published patient registration: {patient_data}")

        timeout = 5
        while not self.response_received:
            if time.time() - start_time > timeout:
                self.environment.events.request_failure.fire(
                    request_type="MQTT",
                    name="register_patient",
                    response_time=(time.time() - start_time) * 1000,
                    exception=Exception("Timeout waiting for MQTT response"),
                )
                return
            time.sleep(0.1)

        if self.response_data and self.response_data.get("status") == "success":
            self.patients_list.append(self.response_data['patient'])
            print(f"Patient registered: {self.response_data['patient']}")
            print(f"Current patients list: {self.patients_list}")

            #If patient is registered book an appointment
            self.book_appointment()

            self.environment.events.request.fire(
                request_type="MQTT",
                name="register_patient",
                response_time=(time.time() - start_time) * 1000,
                response_length=len(json.dumps(self.response_data)),
                exception=None,
            )
        else:
            self.environment.events.request.fire(
                request_type="MQTT",
                name="register_patient",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=Exception(f"Error response: {self.response_data}"),
            )


    def get_random_patient(self):
        """Returns a random patient from the list"""
        if self.patients_list:
            selected_patient = random.choice(self.patients_list)
            print(f"Selected patient: {selected_patient}")
            return selected_patient
        else:
            ("No patient found.")
            return None

    def get_all_dentists(self):
        """Simulate retrieving all dentists."""
        start_time = time.time()
        self.response_received = False
        self.client.publish(DENTISTS_GET_ALL_TOPIC, json.dumps({}))
        print("Published request to get all dentists")

        timeout = 5
        while not self.response_received:
            if time.time() - start_time > timeout:
                self.environment.events.request_failure.fire(
                    request_type="MQTT",
                    name="get_all_dentists",
                    response_time=(time.time() - start_time) * 1000,
                    exception=Exception("Timeout waiting for MQTT response"),
                )
                return
            time.sleep(0.1)

        if self.response_data and self.response_data.get("status") == "success":
            self.dentists_list.extend(self.response_data.get("dentists", []))

            self.environment.events.request.fire(
                request_type="MQTT",
                name="get_all_dentists",
                response_time=(time.time() - start_time) * 1000,
                response_length=len(json.dumps(self.response_data)),
                exception=None,
            )
        else:
            self.environment.events.request.fire(
                request_type="MQTT",
                name="get_all_dentists",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=Exception(f"Error response: {self.response_data}"),
            )

    def get_random_dentist(self):
        """Returns a random dentist from the list"""
        self.get_all_dentists()

        if self.dentists_list:
            selected_dentist = random.choice(self.dentists_list)
            print(f"Selected dentist: {selected_dentist}")
            return selected_dentist
        else:
            print("No dentist found.")
            return None


    def get_dentist_timeslots(self):
        """Simulate retrieving available timeslots for a random dentist."""
        dentist = self.get_random_dentist()

        if dentist:
            dentist_id = dentist['_id']
            payload = {
                'dentistId': dentist_id
            }

            start_time = time.time()
            self.response_received = False
            self.client.publish(TIMESLOTS_GET_AVAILABLE_TOPIC, json.dumps(payload))
            print("Published request to get dentists timeslots")

            timeout = 5
            while not self.response_received:
                if time.time() - start_time > timeout:
                    self.environment.events.request_failure.fire(
                        request_type="MQTT",
                        name="get_dentist_timeslots",
                        response_time=(time.time() - start_time) * 1000,
                        exception=Exception("Timeout waiting for timeslots response"),
                    )
                    return
                time.sleep(0.1)
            if self.response_data and self.response_data.get("status") == "success":
                timeslots = self.response_data.get("timeslots", [])
                self.environment.events.request.fire(
                    request_type="MQTT",
                    name="get_dentist_timeslots",
                    response_time=(time.time() - start_time) * 1000,
                    response_length=len(json.dumps(self.response_data.get("timeslots", []))),
                    exception=None,
                )
                print(f"Successfully retrieved timeslots: {timeslots}")
                return timeslots
            else:
                self.environment.events.request.fire(
                    request_type="MQTT",
                    name="get_dentist_timeslots",
                    response_time=(time.time() - start_time) * 1000,
                    response_length=0,
                    exception=Exception(f"Error response: {self.response_data}"),
                )
                print(f"Error retrieving timeslots: {self.response_data}")
                return []
        else:
            print("No dentist found to fetch timeslots for.")
            return []

    def book_appointment(self):
        """Simulate booking an appointment with a dentist"""
        timeslots = self.get_dentist_timeslots()
        available_timeslot = next((slot for slot in timeslots if not slot.get("isBooked")), None)

        if available_timeslot:
            print(f"Booking timeslot: {available_timeslot}")

            timeslot_id = available_timeslot['_id']
            print(f"Timeslot ID: {timeslot_id}")

            timeslot_time = available_timeslot['time']
            print(f"Timeslot TIME: {timeslot_time}")

            dentist_id = available_timeslot['dentistId']
            print(f"Dentist ID: {dentist_id}")

            patient = self.get_random_patient()
            print(f"Selected patient: {patient}")

            if not patient:
                print("Error: No valid patient found.")
                return

            patient_id = patient['_id']
            print(f"Patient ID: {patient_id}")

            patient_name = patient['firstName'] + "" + patient['secondName']
            print(f"Patient NAME: {patient_name}")

            patient_email = patient['email']
            print(f"Patient EMAIL: {patient_email}")

            payload = {
                "timeslotId": timeslot_id,
                "time": timeslot_time,
                "dentistId": dentist_id,
                "patientId": patient_id,
                "patientName": patient_name,
                "patientEmail": patient_email
            }

            start_time = time.time()
            self.response_received = False
            self.client.publish(APPOINTMENTS_CREATE_TOPIC, json.dumps(payload))
            print("Published request to book an appointment")

            timeout = 5
            while not self.response_received:
                if time.time() - start_time > timeout:
                    self.environment.events.request_failure.fire(
                        request_type="MQTT",
                        name="book_appointment",
                        response_time=(time.time() - start_time) * 1000,
                        exception=Exception("Timeout waiting for appointment creation response"),
                    )
                    return
                time.sleep(0.1)

            if self.response_data and self.response_data.get("status") == "success":
                print(f"Appointment booked successfully: {self.response_data}")
                self.environment.events.request.fire(
                    request_type="MQTT",
                    name="book_appointment",
                    response_time=(time.time() - start_time) * 1000,
                    response_length=len(json.dumps(self.response_data)),
                    exception=None,
                )
            else:
                self.environment.events.request.fire(
                    request_type="MQTT",
                    name="book_appointment",
                    response_time=(time.time() - start_time) * 1000,
                    response_length=0,
                    exception=Exception(f"Error response: {self.response_data}"),
                )
        else:
            print("No available timeslots for booking.")
            return None

@events.test_stop.add_listener
def test_stop(environment, **kwargs):
    print("Test finished.")
