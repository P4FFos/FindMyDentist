
# Social contract 

### Group members 
- Danylo Baranov @danylob
- Stefan Tram @stefantr
- Mykhailo Serdiuk @mykhailo

### Learning objectives

> As a group we like the process of implementing unique and helpful ideas into products. 
> 
> We aim to expand our knowledge on distributed systems development area . As a group we are aiming for grade 4 and would try our best to get it

### Communication and organisation
> We are planning to have two meetings per week, we think that one remote and one IRL meeting works the best for our team. We agreed on Monday and Thursday meetings, the duration of the meeting depends on the workload (Expected 2 hours for each meeting). During the Monday meeting we would discuss the agenda and tasks for the week, while during the Thursday meeting we would conclude the week progress and make some plans for the future week. At the start of each Milestone we would have planning meeting where we would discuss tasks and plan issues for the milestone. At the end of each Milestone we are going to have an additional meeting to conclude a retrospective and document what went well.
> 

> We are going to communicate through Discord and share information via Google Drive and GitLab. 
> 

> The project management role is assigned to Danylo Baranov - @danylob by voting of each group member

> We are going to solve conflicts through two different procedures. If the issue is personal, first step will be to inform the Project Manager about the issue. If either the PM is involved with the issue or a census cannot be formed the issue will be put up on a group meeting. In case the issue is not solved, the second step will involve the PM contacting the Course Examiner or TA to figure out what the team should do. 
> 

> Decisions about project features and ideas would be discussed during the meetings and voted by each member of the team. 

> If the person is late for the meeting without informing beforehand, the group will wait for 10 minutes and start the meeting. 

### Tech stack
- Vue.js: Web based intefrace 
- GUIMongoDB: database 
- Java: middleware 
- Eclipse Mosquitto: message broker
- Eclipse Paho: MQTT client library

### Testing strategy
Each team member would create Postman tests in order to test functionality, additionaly we use integration test for each of the feature we create  


# System Architecture
Our team decided to use a Service-Oriented Architecture (SOA) with a dual-database strategy to improve both security and availability. The system will rely on a main database that stores all essential data for dentists, patients, appointments, and logs/statistics. A second database, functioning as a real-time replica of the main one, will ensure data redundancy, enhancing data security, high availability, and disaster recovery. The architecture is split into two main subsystems: one for dentists and the other to patients. These subsystems will communicate with the frontend through an API. Additionally, to manage appointments and scheduling, an MQTT broker will be used, utilising a publish/subscribe style to manage communication and ensure efficient coordination between the dentist and patient subsystems

### Component Diagram 
![ ](https://git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_08/group-8/findmydentist/-/raw/1-issue-1-readme-start/docs/Component%20diagram.png?ref_type=heads)

### ER Diagram

