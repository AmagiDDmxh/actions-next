# Actions Next

Become a e-beggar, to be or not to be

## Developemnt

```
npm install
npm run dev
```

## Config

The configuration file is put on [./beggar-config.json](./beggar-config.json), simply clone this project and change it to your own.

```jsonc
{
  "recipient": "<Your wallet>",
  "amounts": [0.01, 0.05, 0.1], // amount setting
  "defaultAmount": 0.1,
  "avatar": "<Your avatar url>",
  "title": "<Donation title>",
  "description": "<Donation description>"
}
```

## Deployment

Using vercel, try using the vercel button, after the cloning process, you should able to setup your own repo and edit the config to your own.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmagiDDmxh%2Factions-next&project-name=my-actions-next&repository-name=my-actions-next)
