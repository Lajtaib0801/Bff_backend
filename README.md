# 14AB-D-Backend

## Tests

To run tests you need [Docker](https://www.docker.com/), [Smtp4dev](https://github.com/rnwood/smtp4dev) and some kind of command prompt.

With our script the `smtp server runs on the localhost:8090`, and the `imap is on the localhost:2525`

```cmd
docker run --rm -it -p 8090:80 -p 2525:25 rnwood/smtp4dev
```

To execute them you'll need another one command prompt, while the previous command is still running of course.
Run it in the root directory of the project:

```cmd
npm run test
```

Smtp4dev sometimes can be slow, it depends on your computer. Try to run it again if it fails.
If some of the tests fail because of "before all" hook, you may have to edit the `test script` in the `package.json`.
By default mocha uses 2 seconds, but because of Smtp4dev I had to increase it to 5 seconds. If it fails to you even with 5 seconds, try to increase it even more for example to 8 seconds.

Like this:

```json
"test": "npx env-cmd -f .env.test mocha --timeout 8000 --exit",
```

The result should be something like this:

[![Running tests](https://img.youtube.com/vi/OyWecKKZy4o/maxresdefault.jpg)](https://www.youtube.com/watch?v=OyWecKKZy4o)
