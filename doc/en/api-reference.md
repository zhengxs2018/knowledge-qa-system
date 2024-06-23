# API Reference

## Bots

Build bots that can call models and chat conversations.

### List bots

`GET /bots`

Returns a list of bots.

#### Returns

A list of bots objects.

### Retrieve bot

`GET /bots/:name`

Retrieves a bot.

#### Returns

The bot object matching the name.

## Runs

Create runs based on bots that can interact with puppets.

Related guide: [Bots](#bots) and Wechaty Puppets.

### Create puppet and run

`POST /bots/:name/runs`

Create a puppet and run it in one request.

#### Returns

A run object.

### Cancel a run

`GET /bots/:name/runs/cancel`

Cancels a run that is puppet.

#### Returns

The modified run object matching the name.

## Logs

Listen to bot event logs

Related guide: [Bots](#bots)

### Listen to all bot logs

`GET /bots/logs`

#### Returns

Returns a list of log object.

### Listen to a bot logs

`GET /bots/:name/logs`

#### Returns

Returns a list of log object.
