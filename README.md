# osubot
An osu!-related bot for VK

## How to run:

1. Clone repository

```
git clone https://github.com/OctoDumb/osubot-old
cd osubot
```

2. Install dependencdies

```
npm i
```

3. Create a config `config.json`
```jsonc
{
    "vk": {
        "token": "Your group's token",
        "id": 435325354, // Your group's ID
        "owner": 5435325 // Your ID
    },
    "tokens": {
        "bancho": "Bancho token",
        "ripple": "Ripple token (useless atm)"
    },
    "osu": {
        "username": "Your osu! username",
        "password": "Your osu! password"
    }
}
```

4. Build & run

```
npx tsc
npm start
```
