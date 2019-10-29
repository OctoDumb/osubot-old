# osubot
An osu!-related bot for VK

## How to run:

1. Clone repository

```
git clone https://github.com/OctoDumb/osubot
cd osubot
```

2. Install dependencdies

```
npm install
```

3. Create a config `config.json`
```json
{
    "vk": {
        "token": "Your group's token",
        "id": 435325354, // Your group's ID
        "owner": 5435325 // Your ID
    },
    "tokens": {
        "bancho": "Bancho token",
        "ripple": "Ripple token"
    }
}
```

4. Build & run

```
npm run-script prepare
npm start
```