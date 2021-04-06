# acdc-backoffice-backend

This includes only the REST services + database.

A stack of nest-js, typeorm, postgresql.

The frontend web interface is at repo acdc-backoffice-frontend.


Instructions for a developer to setup a working directory.

## Git Clone

As a regular user, create a default project directory and perform

https://github.com/PharmaLedger-IMI/acdc-backoffice-backend.git

In this directory, a folder called acdc-backoffice-backend was created.
Below, please replace PROJECT-ROOT with the full path to this folder.


## Setup local PostgreSQL database

### Install PostgreSQL client+server+contrib+libpq

Read setup.sh, and execute it as root.

### Instructions to setup acdc database

As root, type

```bash
sudo su - postgres
cd PROJECT-ROOT/lib/sql/acdc/install
psql
\i setup.sql
\q
```

This will create a Postgres user acdc, password acdc,
owner of a database named acdc.

As your regular user, setup the acdc database tables and data:

```bash
cd PROJECT-ROOT/lib/sql/acdc/install
psql --host=localhost acdc acdc
drop owned by acdc; -- not needed on initial creation
\i acdc.sql
\q
```

PS: The --host=localhost is to prevent the peer authentication issue - https://stackoverflow.com/questions/18664074/getting-error-peer-authentication-failed-for-user-postgres-when-trying-to-ge


## Database First

This project works in "database first" mode. This means that, for any change/addition to the database, they are first developed on the SQL side, and only afterwards on the TypeScript entities.

### Before Production Release

No need for database migrations.
Just edit the PROJECT-ROOT/lib/sql/acdc/install/acdc.sql file, and re-create the database as needed.
(Please attempt to keep existing user's data. Communicate with the users when there are questions about what to keep/discard between releases).

### After Production Release

For each incremental change there is an associated database migration. See doc/Memos/dbConventions.txt (TODO: import it from other project).

### Data Model Editor

This is no "official data model editor". The PROJECT-ROOT/lib/sql/acdc/install/acdc.sql file is the data-model and initial data.

You may use a tool such as the "Community Edition" of
https://dbschema.com/
to change the database, and then generate an updated acdc.sql file
with the command

```bash
pg_dump --host=localhost -U acdc > PROJECT-ROOT/lib/sql/acdc/install/acdc.sql
```

Please communicate with your team the update of the data model, and take care
do not commit toxic data for your team-mates.

## Node and npm

Major nodeJS version is 14. npm version was 6. (Latest stable versions).
(This does not mean it does not work with higher versions. Just means that the developers are using these versions).

## Test

After cloning the project, and setting up the postgreSQL database, 
```
cd PROJECT-ROOT/
npm install
npm run start
```

With the browser access 

http://localhost:3000/borest/api

and see an (Swagger / OpenAPI) API description page.

If you test the /borest/auth/login API with an existing user+password,
and set the JWT token, you should be able to access

http://localhost:3000/borest/acdc/locale

and see a JSON listing of the contents of table locale.


# TODOs

For internal discussion:

* file layout under acdc-backoffice-backend
```
.
├── dist  (binary .ts compiled to .js - ignored in GIT)
├── lib   (PDM/G4M style folder for other language files)
│   └── sql
│       └── acdc
│           └── install
│               ├── acdc.sql  (acdc DB schema and initial data)
│               └── setup.sql   (create pgsql user and db named acdc)
├── nest-cli.json (NestJS project config)
├── node_modules  (created by npm install - ignored in GIT)
├── ormconfig.json (typeorm configuration)
├── package.json   (npm configuration)
├── package-lock.json (should be in GIT according to https://github.com/npm/cli/blob/release-6.14.7/docs/content/configuring-npm/package-lock-json.md )
├── README.md (this file)
├── setup.sh  (help in setting up Ubuntu packages)
├── src
│   ├── app.controller.spec.ts  (test file for main app)
│   ├── app.controller.ts       (main controller for "/" path)
│   ├── app.module.ts           (main module - includes the acdc module)
│   ├── app.service.ts          (main service logic)
│   ├── acdc                  (DB acdc - for each table there is a TableName.entity.ts ; tablename.controller.ts )
│   │   ├── appresource.controller.ts
│   │   ├── appresource.entity.ts
│   │   ├── acdc.module.ts  (includes all controllers under acdc)
│   │   ├── locale.controller.ts
│   │   └── locale.entity.ts
│   └── main.ts  (NetJS main app instantiation)
├── tsconfig.build.json        (typescript compiler configuration)
├── tsconfig.json              (typescript dialect configuration)
```

* Should the "*.entity.ts" be capitalized like the class name ? jpsl 2021-03-02 No. All examples user lower-case.

* Write table.service.ts classes only for tables that need significant server-side logic ?

* Should PostgreSQL schema be changed to match typeorm conventions ?

    * appresource -> app_resource

    * appresource.locale -> appresource.localeCode

* there is no REST versioning prefix. Example: "v1" in http://localhost:3000/v1/acdc/appresource. All URLs start with /acdc/TABLE are mapped to acdc DB.

* authentication and authorization  (Maybe do a bit of Angular frontend, and then see what is needed).

* controllers are using "syncrhonous" (blocking) DB access. That is bad for a single-threaded server. Re-write full-async.

* arc.update() updates all fields vs arc.updateFieldXYZ() ? jpsl: Choose the later. But typeorm seems smart, and updated everything but the primary key. See the pgsql log for a full "arc.update()":

```
2020-12-16 18:48:07.310 WET [45239] [unknown]@[unknown] LOG:  connection received: host=127.0.0.1 port=47068
2020-12-16 18:48:07.314 WET [45239] acdc@acdc LOG:  connection authorized: user=acdc database=acdc
2020-12-16 18:48:07.319 WET [45239] acdc@acdc LOG:  execute <unnamed>: SELECT "AppResource"."id" AS "AppResource_id", "AppResource"."key" AS "AppResource_key", "AppResource"."value" AS "AppResource_value", "AppResource"."help" AS "AppResource_help", "AppResource"."locale" AS "AppResource_locale" FROM "appresource" "AppResource" WHERE "AppResource"."id" IN ($1)
2020-12-16 18:48:07.319 WET [45239] acdc@acdc DETAIL:  parameters: $1 = '1'
2020-12-16 18:48:07.321 WET [45239] acdc@acdc LOG:  statement: START TRANSACTION
2020-12-16 18:48:07.324 WET [45239] acdc@acdc LOG:  execute <unnamed>: UPDATE "appresource" SET "value" = $2, "locale" = $3 WHERE "id" IN ($1)
2020-12-16 18:48:07.324 WET [45239] acdc@acdc DETAIL:  parameters: $1 = '1', $2 = '0.0.1x', $3 = NULL
2020-12-16 18:48:07.325 WET [45239] acdc@acdc LOG:  statement: COMMIT
2020-12-16 18:48:07.341 WET [45239] acdc@acdc LOG:  disconnection: session time: 0:00:00.031 user=acdc database=acdc host=127.0.0.1 port=47068
```

* arc.delete(id) should return void or an AppResource ? Why one or the other ?

* JWT tokens expire in a fixed time span regardless of frontend (in)activity, possibly forcing user to relogin after a fixed time period. Should we use a background refresh strategy (such as https://jasonwatmore.com/post/2020/05/22/angular-9-jwt-authentication-with-refresh-tokens ) ? Unusual Angular behaviour compared to other classic web frameworks - private talk with Diogo https://discord.com/channels/525662653012770826/525662653012770828/816992112784572436

