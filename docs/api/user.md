# User API Examples

| API         | Returns           | Description                                            |
| ----------- | ----------------- | ------------------------------------------------------ |
| `getUser`   | `GetUserResponse` | Retrieve one user by ID.                               |
| `getSelf`   | `GetSelfResponse` | Retrieve the bot user that owns the integration token. |
| `listUsers` | `UserObject[]`    | List every workspace user, following all cursors.      |

## List users for a people column

```ts
import { listUsers } from "simple-notion-orm";

const users = await listUsers();
const people = users.filter((user) => user.type === "person").map((user) => ({ id: user.id }));
```

## Check which integration a token belongs to

```ts
import { getSelf } from "simple-notion-orm";

const bot = await getSelf();
console.log(bot.name);
```
