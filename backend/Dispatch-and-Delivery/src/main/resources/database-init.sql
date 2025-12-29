DROP TABLE IF EXISTS authorities;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id         SERIAL PRIMARY KEY   NOT NULL,
    email      TEXT UNIQUE          NOT NULL,
    password   TEXT                 NOT NULL,
    enabled    BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE authorities
(
    id        SERIAL PRIMARY KEY NOT NULL,
    email     TEXT               NOT NULL,
    authority TEXT               NOT NULL,
    CONSTRAINT fk_customer FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE
);

