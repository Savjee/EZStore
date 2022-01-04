# EZStore

[![Serverless badge](https://camo.githubusercontent.com/dcd998f0b6567f17873812fa9bcc9767d63c056862c19024ccbfe5ec7cefe2eb/687474703a2f2f7075626c69632e7365727665726c6573732e636f6d2f6261646765732f76332e737667)](http://www.serverless.com/)
[![Build status](https://github.com/Savjee/EZStore/actions/workflows/build.yaml/badge.svg)](https://github.com/Savjee/EZStore/actions/workflows/build.yaml)

A tiny serverless datastore for IoT data. Powered by AWS Lambda, DynamoDB and API Gateway.

---

## Contents
* [Basic usage](#basic-usage)
* [Get started](#get-started)
* [Project goals](#project-goals)
* [Contributions](#contributions)

---

## Basic usage
EZStore has two HTTP API's: one to ingest data and one to retrieve it.

IoT devices can push their data to EZStore with a simple HTTP POST request containing a JSON document:

```
POST /ezstore/v1/metrics/{deviceId}

{
    "temperature": 21.67,
    "humidity": 65.10
}
```

To retrieve that data, simply do a GET request for the same `deviceId`:

```http
GET /ezstore/v1/metrics/{deviceId}

{
    "data": [
        {
            "temperature": 21.67,
            "humidity": 65.10,
            "timestamp": 1641286719828
        }
    ]
}
```

By default, a GET request will return data from the last 7 days. You can also define your own date range by using the `start_date` and `end_date` parameters:

```
GET /ezstore/v1/metrics/{deviceId}?start_date=2021-08-01&end_date=2021-08-31
```

## Get started

Clone this repository:

```
git clone https://github.com/Savjee/EZStore.git
```

Install dependencies:

```
npm install
```

Deploy to AWS!
```
sls deploy
```

## Restricting access
By default, EZStore will happily serve any request. 
If you want to limit access, implement a custom authorizer in the `serverless.yml` file.

TODO: give an example ;)

## Project goals

* Small & nimble.

## Contributions
Feel free to fork, improve and open pull requests.
