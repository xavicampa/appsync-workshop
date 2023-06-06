---
author: F. Javier L. Campa
date: dd MMMM YYYY
---
# Yo
Avilés 🇪🇸 1981 🦖
# MSc. Computer Science
* Universidad de Oviedo (_MSc. Thesis_ Universitet i Oslo)
# 2008 - 2021 Visma
* .NET developer, architect, team manager, solutions architect
# 2021 - now Webstep
* Infrastructure and development in AWS, mainly backend 🐍 some frontend ⚛️
### Outside of work
* Computers 💻🪛
* Cars 🏎
* Tennis 🎾
* Golf from Saturday? 🤓🏌
---
# API journey
_2011_ __Provisioning API__ for Visma (SOAP, .NET 3.5, on-prem IIS)

_2014_ __SCIM API__ for Visma identities (REST, .NET 3.5, AWS BeanStalk)

_2016_ __Admin API__ for Visma Connect IdP (REST, .NET Core, AWS ECS)

_2018_ __Serverless Speech API__ for Visma Serverless course (REST, .NET Core, AWS Lambda)

_2020_ __API Maturity Assessment__ for Visma SDTs (Software Delivery Teams)

_2021_ __Measurements API (IoT)__ for TAG Sensors (REST, .NET, AWS Lambda)

_2022_ __Developing REST APIs using API CodeFlow__ (Webstep Fagdag 2022 foredrag)

_2022_ __Studies API__ for Aidee Health AS (GraphQL, Python, AWS AppSync)
---
# Agenda
* Quick overview
    * API technologies
    * Authentication mechanisms
* Customer case: Aidee Health
* GraphQL
    * schema
    * resolvers
    * mapping templates
* Authentication: OpenID Connect (HelseID)
* Authorization
## What we won't cover
* Advanced GraphQL features
    * Delegation, Transforms, Merging/Stitching
* Cognito + HelseID integration
---
# Overview of API technologies
- REST
- SOAP
- GraphQL
- gRPC
##### Skip? Jump 3!
---
## REST
- Verb + RESOURCE + [CHANGE] __=__ HTTP_STATUS + [STATE]
- OpenAPI/Swagger
- De facto standard, easy to understand
### SOAP
- Service oriented, complex types and function calls
- WSDL
- Been around a while!
---
## GraphQL
- Minimize round trips to the API (get what you need, not more, not less)
- GraphQL Schema
- Easy to unify heterogenous backends through a common schema/gateway
### gRPC
- Serialization-Deserialization into raw-byte
- Protocol buffers
- Resource efficient!
---
# Aidee Health AS (aidee.io)
Next generation continuous blood pressure sampling devices
## Project
Web application to register and display patient and equipment reference data
### Actors
* Patients/users
* Doctors
* Data analysts
* Administrators
#### Requirements
* Authentication through national health identity providers
* Strict data isolation
---
# Architecture
```
~~~graph-easy --as=boxart
[Web] -> [API] -> [DB]
~~~
```
## React + AmplifyJS/UI (TypeScript) Amazon CloudFront (CDN)
### AWS AppSync (GraphQL)
#### Amazon DynamoDB (NoSQL)
---
# GraphQL schema
## Types
```graphql
type Patient {
    id: ID!
    name: String!
    age: Int!
}
```
## Inputs
```graphql
input PatientInput {
    name: String!
    age: Int!
}
```
---
## Queries
```graphql
type Query {
    getPatient(patientid: ID!): Patient
}
```
## Mutations
```graphql
type Mutation {
    createPatient(input: PatientInput!): Patient
}
```
## Subscriptions
```graphql
type Subscription {
    onCreatedPatient(patientid: ID): Patient
}
```
---
# GraphQL examples
## Simple query
```json
{
    "query": "query GetPatient($patientid: ID!){ getPatient(patientid: $patientid) { name }",
    "variables": {
        "patientid": "patient1234"
    }
}
```
### Response
```json
{
    "data": {
        "getPatient": {
            "name": "Pedro"
        }
    }
}
```
---
## Simple mutation
```json
{
    "query": "mutation CreatePatient($input: PatientInput!){ createPatient(input: $input) { name age } }",
    "variables": {
        "input": {
            "name": "Pedro",
            "age": 42
        }
    }
}
```
### Response
```json
{
    "data": {
        "createPatient": {
            "name": "Pedro",
            "age": 42
        }
    }
}
```
---
# Query depth
```
~~~graph-easy --as=boxart
[Hospital]- has-many ->[Patient]
~~~
```
```graphql
type Hospital {
    id: ID!
    address: String!
    name: String!
    patients: [Patient]
}
```
```graphql
type Patient {
    id: ID!
    age: Int!
    name: String!
    gender: String!
    hospital: Hospital
}
```
---
# Imagine the following requirement
_"Retrieve hospital, age and gender for all patients"_
## REST
```
GET /hospital?fields=id,name
foreach(h in hospital.id)
    GET /hospital/h/patient?fields=name,gender
```
---
# Imagine the following requirement
_"Retrieve hospital, age and gender for all patients"_
## REST
```
GET /hospital?fields=id,name
foreach(h in hospital.id)
    GET /hospital/h/patient?fields=name,gender
```
### GraphQL
```
query listPatients {
    age
    gender
    hospital { name }
}
```
---
# Query depth (II)
```
~~~graph-easy --as=boxart
[Hospital]- has-many ->[Patient]- has-many ->[Measurements]
~~~
```
```graphql
type Patient {
    id: ID!
    age: Int!
    name: String!
    gender: String!
    hospital: Hospital
    measurements: [Measurement]
}
```
```graphql
type Measurement {
    timestamp: Int!
    bloodPressure: Float!
    pulse: Int!
}
```
---
# Listing requirement for frontend
_"Retrieve age, gender and measurements for all patients"_
## REST
```
GET /hospital?fields=id
foreach(h in hospital.id)
    GET /hospital/h/patient?fields=id,age,gender
    foreach(p in patient.id)
        GET /hospital/h1/patient/p/measurements
```
---
# Listing requirement for frontend
_"Retrieve age, gender and measurements for all patients"_
## REST
```
GET /hospital?fields=id
foreach(h in hospital.id)
    GET /hospital/h/patient?fields=id,age,gender
    foreach(p in patient.id)
        GET /hospital/h1/patient/p/measurements
```
### GraphQL
```
query listHospital {
    patients {
        age
        gender
        measurements { timestamp bloodPressure pulse }
    }
}
```
---
# Resolvers
_"How is data fetched from the data source?"_
---
# Resolvers
_"How is data fetched from the data source?"_
## Query resolvers
```graphql
type Query {
    getHospital(hospitalId:ID!): Hospital # How do we fetch data?
}
```
---
# Resolvers
_"How is data fetched from the data source?"_
## Query resolvers
```graphql
type Query {
    getHospital(hospitalId:ID!): Hospital # How do we fetch data?
}
```
## Field resolvers
```graphql
type Hospital {
    id: ID!
    name: String!
    patients: [Patient] # How do we populate this field?
}
```
---
# Resolvers
_"How is data fetched from the data source?"_
## Defining resolvers (AWS AppSync)
- type
- field
- data source
- request template
- response template
---
## Query resolvers
```graphql
type Query {
    getHospital(hospitalId:ID!): Hospital
}
```
Resolver:
```json
{
    "type": "Query",
    "field": "getHospital",
    "datasource": "HospitalsTable in DynamoDB",
    "request mapping template": "getHospital_request.vtl",
    "response mapping template": "getHospital_response.vtl"
}
```
---
### getHospital_request.vtl
```json
{
    "version": "2017-02-28",
    "operation": "GetItem",
    "key": {
        "hospitalId": $util.dynamodb.toDynamoDBJson($context.args.hospitalId)
    }
}
```
### getHospital_response.vtl
```json
$utils.toJson($context.result)
```
---
## Field resolvers
```graphql
type Hospital {
    id: ID!
    name: String!
    patients: [Patient] # How to populate this field?
}
```
Resolver:
```json
{
    "type": "Hospital",
    "field": "patients",
    "datasource": "PatientsTable in DynamoDB",
    "request mapping template": "hospitalPatients_request.vtl",
    "response mapping template": "hospitalPatients_response.vtl"
}
```
---
### hospitalPatients_request.vtl
```json
{
    "version": "2017-02-28",
    "operation": "Query",
    "query": {
        "expression": "hospitalId = :hospitalId",
        "expressionValues": {
            ":hospitalId": {
                "S": $util.toJson($context.source.hospitalId)
            }
        }
    }
}
```
### hospitalPatients_response.vtl
```json
$utils.toJson($context.result)  # list of items
```
---
## Execution of a query
```graphql
query getHospital("h1") {
    name
}
```
---
## Execution of a query
```graphql
query getHospital("h1") {
    name
}
```
## Flow
```
~~~graph-easy --as=boxart
[Request]- 1. getHospital ->[Query Resolver]- 2. req. mapping template ->[Data source]
[Data source]- 3. resp. mapping template ->[Query Resolver]
[Query Resolver]->[Response]
~~~
```
---
## Execution of a query (II)
```graphql
query getHospital("h1") {
    name
    patients { name }
}
```
---
## Execution of a query (II)
```graphql
query getHospital("h1") {
    name
    patients { name }
}
```
## Flow
```
~~~graph-easy --as=boxart
[Request]- patients ->[ Field Resolver ]->[Response]
[Request]- getHospital ->[ Query Resolver ] -> [Response]
~~~
```
---
## Resolvers: other topics
- Rate limiting and depth limiting
- Pagination (_nextToken_)
- Other data sources, including Lambda
- _Pipeline resolvers_
---
# Authentication mechanisms
## API keys
- Static secret shared between client and server
- Must be rotated
- Can leak, be stolen, etc.
### m(utual)TLS
- Both client and server verify certificates mutually
- Added operational complexity: certificate issuing, revocation lists, renewals, etc.
- Best suited for machine-to-machine
---
## OAuth 2.0 and OpenID Connect (OIDC)
* OpenID Connect extends OAuth 2.0 with user authentication and SSO
* OAuth 2.0 controls authorization
* Separation of authentication and authorization, client (browser, mobile app) and user (person)
- Multiple authentication flows to fit different requirements
---
## OAuth 2.0 and OpenID Connect (OIDC)
- Identity Provider (IdP): a third party verifying the users identity
    - Normally through username+password, 2FA, etc.
---
## OAuth 2.0 and OpenID Connect (OIDC)
- Identity Provider (IdP): a third party verifying the users identity
    - Normally through username+password, 2FA, etc.
* IdP authenticates user and provides a token to the client (browser)
    * identity and claims
    * cryptographically protected against tampering (cannot be altered)
    * short life (quick expiration)
---
# Integrating HelseID (OpenID Connect) with AWS services
```
~~~graph-easy --as=boxart
[Web] <-> [Cognito] <-> [HelseID]
[Web] <-> [API] <-> [Cognito]
~~~
```
## Amazon Cognito
- User directory
- OpenID Connect _identity_/_service_ provider
- Integrates with multitude of AWS services
- Supports external login with third-party SAML and OpenID Connect identity providers
### HelseID
- National authentication service for the healthcare sector in Norway
- OpenID Connect _identity_ provider
---
## Code flow
```
~~~graph-easy --as=boxart
[Web] - 1 -> [Cognito] - 2 -> [HelseID]
[HelseID] <-> [BankID]{ border: 1px dotted black; }
~~~
```
1. App redirects to Cognito on Login
2. Cognito checks cookie, if not present redirects to HelseID
---
## Code flow
```
~~~graph-easy --as=boxart
[Web] -> [Cognito] -> [HelseID]
[HelseID] - 3 -> [BankID]{ border: 1px dotted black; }
[HelseID] <- 4 -> [BankID]{ border: 1px dotted black; }
~~~
```
3. HelseID checks cookie, if not present redirects to third-party IdP (BankID, IDPorten)
4. Third-party IdP
- Beyond HelseID is a black box for us
---
## Code flow
```
~~~graph-easy --as=boxart
[Web] -> [Cognito] -> [HelseID]
[HelseID] <-> [BankID]{ border: 1px dotted black; }
[HelseID] - 5 code -> [Cognito]
[Cognito] - 6 id_token -> [HelseID]
~~~
```
5. HelseID redirects to Cognito with a _code_ in the URL (_front-channel_)
6. Cognito uses _code_ to retrieve HelseID _id_token_ through an API call (_back-channel_)
---
## Code flow
```
~~~graph-easy --as=boxart
[Web] - 8 id_token -> [Cognito] -> [HelseID]
[HelseID] <-> [BankID]{ border: 1px dotted black; }
[Cognito] - 7 code -> [Web]
~~~
```
7. Cognito redirects to Web with a _code_ in the URL
8. Web uses _code_ to retrieve Cognito _id_token_ through an API call
- User is authenticated with Cognito and the client (browser) has a _Cognito token_
---
### Example Cognito token
```json
{
  "sub": "c1a1d232-df61-4157-b7d2-38881191e55c",
  "cognito:groups": [
    "hp",
  ],
  "custom:idp.hp_number": "43218765",
  "exp": 1681462824,
  "given_name": "Aemon",
  "aud": "HealthApp",
  "name": "Aemon Targaryen",
  "family_name": "Targaryen",
  [...]
}
```
---
## Token validation
* Client validates token
    - sends it when issuing API calls
- API validates token
    - valid _audience_
    - online or offline
* API authorizes call
    - how?
---
# Authorization
_"Who can do what?"_
---
# Authorization
_"Who can do what?"_
### Cognito groups
- health personnel
- patients
- admin
---
# Authorization
_"Who can do what?"_
### Cognito groups
- health personnel
- patients
- admin
## AWS directives in GraphQL schema
- @aws_auth
---
# Authorization
_"Who can do what?"_
### Cognito groups
- health personnel
- patients
- admin
## AWS directives in GraphQL schema
- @aws_auth
#### Custom logic in mapping templates
Velicity Template Language or JavaScript
- Request
- Cognito tokens claims
- Utils
---
# Authorization
Health services - strict data access requirements
- _"Doctors can access patient data"_
- _"Patients can only access their own data"_
- _"Administrators cannot access patients sensitive data"_
---
# Authorization
- _"Doctors can access patient data"_
---
# Authorization
- _"Doctors can access patient data"_
## Schema
```graphql
type Query {
    getPatient(patientId:ID!): Patient  @aws_auth(cognito_groups:["hp"])
}
```
---
# Authorization
- _"Patients can only access their own data"_
---
# Authorization
- _"Patients can only access their own data"_
## Schema
```graphql
type Query {
    getPatient(patientId:ID!): Patient  @aws_auth(cognito_groups:["hp","patient"])
}
```
---
# Authorization
- _"Patients can only access their own data"_
## Schema
```graphql
type Query {
    getPatient(patientId:ID!): Patient  @aws_auth(cognito_groups:["hp","patient"])
}
```
## or even better
```graphql
type Query {
    getPatient(patientId:ID!): Patient  @aws_auth(cognito_groups:["hp"])
    getPatient(): Patient               @aws_auth(cognito_groups:["patient"])
}
```
* Patients are not allowed to query by patientId
* _Circumvented IDOR (insecure direct object reference)_
* "sub" in JWT token used instead (see next), which cannot be altered
---
# Authorization
- _"Patients can only access their own data"_
## Request mapping template: getPatient
```json
#foreach($group in $context.identity.claims.get("cognito:groups"))
  #if($group == "patient")
    #set($isPatient = true)
    #break
  #end
#if($isPatient)
{
    "version": "2017-02-28",
    "operation": "GetItem",
    "key": {
        "patientid": $util.dynamodb.toDynamoDBJson($context.identity.sub)
    }
}
#else
$utils.unauthorized()
#end
```
---
# Authorization
- _"Administrators cannot access patients sensitive data"_
## Schema
```graphql
type Query {
    getPatient(patientId:ID!): Patient  @aws_auth(cognito_groups:["hp","admin"])
    getPatient(): Patient               @aws_auth(cognito_groups:["patient"])
}

type Patient {
    id: ID!
    age: Int!
    name: String!
    gender: String!
    hospital: Hospital
    measurements: [Measurement]         @aws_auth(cognito_groups:["hp","patient"])
}
```
---
# Group membership
_"How do we know who is a doctor, an administrator, a patient, or all at once!?"_
---
# Group membership
_"How do we know who is a doctor, an administrator, a patient, or all at once!?"_
## Static assignment
- _admin_ group is assigned manually to certain individuals
---
# Group membership
_"How do we know who is a doctor, an administrator, a patient, or all at once!?"_
## Static assignment
- _admin_ group is assigned manually to certain individuals
- _hp_? Sync with HelseID health personel register?
---
# Group membership
_"How do we know who is a doctor, an administrator, a patient, or all at once!?"_
## Static assignment
- _admin_ group is assigned manually to certain individuals
- _hp_? Sync with HelseID health personel register?
## Assignment at login
- Based on the existence of _custom:idp.hp_number_ claim
- Assignment lasts the duration of the session
---
# Hacka litt? 🤓
[https://github.com/xavicampa/appsync-workshop](https://github.com/xavicampa/appsync-workshop)
---
# Thank you!
- Questions? 
- Feedback?
## Contact
󰇮 javier.campa@webstep.no

 @javier

 fjcampalus (barely use it 🙈)

 @fjcampalus (I don't use it 🤦)
