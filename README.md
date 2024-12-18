## Description

Ecosphere Prime Smart App built with NestJS

## Pre-requisites

- NodeJS v21.7.3

- MongoDB v7.0.11

- Redis v6.2.7

## Environment Variables

Create a `.smart_app.env` environment file

```
# GENERAL CONFIG
NPM_CONFIG_PRODUCTION=false
IS_DEBUG_MODE=true
VALID_DURATION=30
CLUSTERS=0

# HEDERA ENVIRONMENT
NODE_ENV=testnet # | mainnet
CLIENT_ENV=testnet # |local-node # | mainnet | testnet
NETWORK=private # | public

DEV_MIRROR_API_URL="https://testnet.mirrornode.hedera.com"
DEV_MIRROR_GRPC_URL="hcs.testnet.mirrornode.hedera.com:5600"

# NESTJS SETTINGS
PORT=4001

# AUTH SECRETS
SESSION_SECRET=uhc87h8347h84gc4cgeuhc873g8c3ecu

# MONGO DB
DEV_MONGO_DB="mongodb://username:password@localhost:27017/db-name" #_YOUR_DEV_MONGODB_HERE

# REDIS
REDIS_URL=127.0.0.1
REDIS_PASSWORD=password
REDIS_PORT=6379

# TESTNET OPERATOR
DEV_NODE_ID=0.0.3791731
DEV_NODE_PRIVATE_KEY=6275495cf0ad4b58d2b305df33897673c0bf8e010ace53333d1fd70d6e136978
DEV_NODE_PUBLIC_KEY=302a300506032b6570032100c4ae2900f9fb80c62341e901691d3c7f0128fbd1910e996d34d360e40508a35e

MAX_AUTOMATIC_TOKEN_ASSOCIATIONS=10
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# watch mode
$ yarn run start:dev
```
