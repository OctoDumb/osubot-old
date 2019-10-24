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
        "id": "Your group's ID"
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