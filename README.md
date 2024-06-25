This repository is part of the "SimpleGameNodeJS" project, where the NodeJS API is versioned. To test the game with this API and database integration, you need to set up a local server and database. Follow these instructions:

    Database:
    Install MySQL Server 8, create a user with access to localhost, and import the "gamedb" database dump (located in the "DB_Dump" folder).

    API:
    Install Node.js and nvm version 20. The other modules are listed in "package.json".
    Rename the ".env_example" file to ".env" and update the following information inside it:

DB_HOST=localhost  // likely stays the same
DB_USER=admin      // your database user account
DB_PASSWORD=1234   // user password
DB_NAME=game_db    // database name

JWT_SECRET=qwerty123456! // Some secret, you can keep this one if you want

EMAIL_SENDER="your_email@email.com" // A real Gmail to test email sending
PASS_SENDER="some_pass"             // Gmail password

The last two items refer to the email used to notify users/players who forget their password and request a reset. You don't need to update these if you don't want to test this feature, but if you do, it must be a Gmail account and the email address must be real. You'll need to configure this account to allow interaction with external APIs.
