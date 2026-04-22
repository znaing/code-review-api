require('dotenv').config();// loads .env variables into process.env

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

/* dotenv reads your .env file and injects the values
into process.env — the global object where Node stores
environment config. process.env.PORT lets you change
the port without touching code, which is important
for deployment. */