# System Architecture
FindMyDentist system uses a **Service-Oriented Architecture (SOA)** and **Publish/Subscribe pattern** with a dual-database strategy to improve both security and availability. The system will rely on a main database that stores all essential data for dentists, patients, appointments, and logs/statistics. A second database, functioning as a real-time replica of the main one, will ensure data redundancy, enhancing data security, high availability, and disaster recovery. The architecture is split into two main subsystems: one for dentists and the other for patients and three services (Notification, Appointment, TimeSlots). Subsystems and services communicate with the frontend GUI through an MQTT Broker (Publish/Subscribe) and use CRUD operations to communicate with the Database. Components communicate via middleware and don’t depend on other components. Each service is divided into a module/node and can be deployed separately. 

#### Subsystem: Patient
- Patient Controller: Responsible for the backend logic of the subsystem
- Patient Model: Initialisation of a specific format that the entity has in the database
- Authentication: Manages user authentication, handling patient registration and login
- Main page: Contains a map overview over Gothenburg region with locations of all dentists system has
- Booking page: Allows user to book/cancel an appointment for a specific time slot

#### Subsystem: Dentist
- Dentist Controller: Responsible for the backend logic of the subsystem
- Dentist Model: Initialisation of a specific format that entity has in the database
- Authentication: Manages dentist registration and login
- Scheduler: Helps dentists to manage their availability and appointment slots 
- Appointment Handler: Manages the lifecycle of appointments, including confirmation and rescheduling

#### Notification Service
- Notifications Controller: Saves the notification request to the database
- NodeMailer: Manages email notifications
- Notification Handler: Subscribes to topics in order to send notification
- Notification Sender: Sends notifications based on the topic

#### Appointment Service
- Appointment Controller: Coordinates the scheduling and updating of appointments. It communicates with both the Dentist and Patient subsystems
- Appointment Model: Initialisation of a specific format that the entity has in the database

#### TimeSlots Service
- TimeSlot Controller: allows dentists to create their time slots
- TimeSlot Model: Initialisation of a specific format that entity has in the database

### Synch Service 
- Used to synch the main database and the back up database together 

#### An MQTT broker
Used as a communication middleware component, all subsystems/services subscribe and publish data through it 




# Component Diagram 
![ ](https://github.com/P4FFos/FindMyDentist/blob/development/docs/Component%20diagram.png?raw=true)

# ER Diagram
![ ](https://github.com/P4FFos/FindMyDentist/blob/development/docs/ER%20Diagram.png?raw=true)

# MQTT Diagram 
![ ](https://github.com/P4FFos/FindMyDentist/blob/development/docs/MQTTDiagram.png?raw=true)

# SPEM 2.0 Diagram
![ ](https://github.com/P4FFos/FindMyDentist/blob/development/docs/SPEM%202.0%20diagram.png?raw=true)
