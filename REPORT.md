# SES Drive Report

# Table of Contents

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [API Security](#api-security)
- [Files & Sharing](#files--sharing)
- [Personal Page](#personal-page)
- [Conclusion](#conclusion)

# Introduction
This project is implemented as part of the Security in Software Engineering (SES) course. It is proposed that the group create and implement an internal file-sharing service called SES-Drive.

Considering current standards, the service must be available via a modern website. But in order to pay attention to every actor, a well-documented REST API and a CLI tool for expert users are required.

Regarding the project's scope, we had to focus on the interface, authentication, and access control. Since this is a security project, its scope focuses heavily on the reliability and security of the service.

# Architecture

Early in development we decided to split the concerns as much as possible, while
taking into account the time concerns. We reached a conclusion of splitting into
5 actors:

- [AWS S3](#aws-s3)
- [MongoDB](#mongodb)
- [REST API (Main Server)](#rest-api)
- [Web App](#web-app)
- [CLI Tool](#cli-tool)

![architecture](./.assets/ses-drive-architecture.drawio.png)

## AWS S3

In terms of [S3](https://aws.amazon.com/s3/), we chose it to host the files
instead of hosting on the main server filesystem. This has some benefits,
namely:

- If main server gets compromised, the files are stored securily on a third
  party
- Removes the security concern from us and places it on a third party
- AWS S3 can encrypt the files making it secure in case S3 ever gets compromised
- In our case, only the server has credentials access to S3 that can easily be
  revoked
- For security concerns, we opted to keep the files "flat", meaning no file
  hierarchy exists within S3 itself
- We decided to split `/public` files from `/private` with two separate buckets
  so it does not leak one to another
- For extra layer of security, it was decided to remove the extension from the
  filenames

![flat-system](./.assets/ses-drive-flat-system.png)

## MongoDB

For database it was decided to use [MongoDB Cloud](https://www.mongodb.com/).
Mongo was used because the data structure of files is not that complex. The
Mongo instance basically stores metadata of the files, like the file `mimetype`
or the files permissions. In terms of security, MongoDB Cloud helps was with:

- End to End encryption between the main server and the MongoDB Cloud
- Immune to SQL Injections, although the ORM used also has SQL integration and
  has prepared statements
- The server connects to the MongoDB Cloud with credentials only used by the
  server and those can be easily revoked

## REST API

The REST API is based on [NestJS](https://nestjs.com/), a
[NodeJS](https://nodejs.org/) framework that allows for fast and scalable
development. This NodeJS app is hosted on [Heroku](https://www.heroku.com/).

Hosting on Heroku comes with some advantages, namely:

- PaaS removes the trouble of of configuring Apache, Nginx, Firewalls, etc,
  delegating that trouble to the hosting provider
- Delegates security concerns to the hosting platform, meaning that any upgrades
  to the infrastructure does not affect us
- One of the advantages of Heroku is that the filesystem of the app vanishes
  everytime it restarts. This is a plus, although it **does not affect us
  directly has we _do not store anything on the filesystem_**

## Web App

[Angular](https://angular.io/) was used as the frontend app. Angular is able to
mitigate some security problems, although the developer is responsible in making
sure it does not poke holes into this model. By default these are the problems
it mitigates:

- Cross-site scripting (XSS) as it treats all values as untrusted
- Sanitization
- Cross-site script inclusion (XSSI)

## CLI Tool

For the cli tool, we developed a solution based on [Deno](https://deno.land/).
The main use case for this was the fact that Deno can compile to multiple
architecure and is a secure sandbox by default. What this means is:

- The cli tool only has access to the network, read/write permissions to the
  filesystem
- Can be compiled to `x86_64-unknown-linux-gnu`, `x86_64-pc-windows-msvc`,
  `x86_64-apple-darwin`, `aarch64-apple-darwin`

# Authentication

Authentication is a sensitive topic. We tried to approach it taking two problems
into consideration:

- How do we protect the real user?
- How do we catch a fake user?

**Real User**

The first thing we always saw fit as a mandatory requirement is asking for the
user password to be at least:

- Eight characters long
- Contain at least one uppercase letter
- Contain at least one number character
- Contain at least one special character

These password requirements exist to prevent a brute force attack on the user
password. In fact, having a GTX 1060 can compute around 150,000 passwords per
second. With a requirement of 8 chars, this means that for 26 letters, you have
`26^8` possible combinations, if you divide that for 150,000 it will give you
the amount of seconds required to performe that task and, taking that and
dividing by `60*60*24` (minutes, hours, days) gives you around 16 days.

Following the same line of thought, here are the results for each:

- Eight characters long `26^8` => 16 days
- Contain at least one uppercase letter `52^8` => 4125 days
- Contain at least one number character `62^8` => 16847 days
- Contain at least one special character `95^8` => 511898 days

Another layer of security is the use of a
[Pepper](https://en.wikipedia.org/wiki/Pepper_(cryptography)). In this case, the
Pepper is the same to all users, but only known to the server. It is appended to
each user password working as a _server_ password as follows:
`{user_password}:{pepper}`.

This is effective because unless the attacker is able to obtain the pepper,
cracking even a single hash is intractable, no matter how weak the original
password.

The password is then hashed with a salt that was generated with ten salt rounds
to later be stored in the database.

**Fake User**

To prevent fake users from accessing the app we relied on Google's
[Recaptcha V3](https://developers.google.com/recaptcha/). Recaptcha helps us
with two main problems, bots and CSRF.

In regards to bots, Recaptcha V3 helps detect abusive traffic on the website
without user interaction by returning a score between 0 and 1, where 0 is
definitely a bot and 1 definitely a human. We can then choose which is our
threshold to accept a request. We chose a default of 0.5.

As for Cross-site Request Forgery, Recaptcha can help to mitigate this problem
as the way Recaptcha works is

1. Client talks to Google's server and requests a token signed by Google's
   private key
2. Client sends payload of a form with this token attached to it
3. The server then validates with Google's servers if this token is valid

![authentication](./.assets/ses-drive-authentication.drawio.png)

# Authorization

To cater to the project requirements, we decided that all routes are protected,
therefore only authenticated users can to actions on the REST API.

For the cli tool, we use a API Key mechanism (that can also be used by any other
client). Although this API Key does not give access to user account operations.

For the web app, we decided on the access/refresh token mechanism using Json Web
Tokens. The web app is authorized to to any action on the REST API, including
generating a new API Key.

![authorization](./.assets/ses-drive-authorization.drawio.png)

## JWT Mechanism

The JWT mechanism uses access/refresh token mechanism. The access token is
short-lived (5min by default) whereas the refresh token is long-lived (2weeks by
default).

The access token is used for accessing everything within the app and the refresh
token is only responsible for generating new access tokens. Refresh tokens can
only be used once.

The flow of this mechanism is as follows:

1. SignIn on the App
2. The endpoint returns an access token through the body payload and sets a
   cookie with the `secure`, `httpOnly` and `path` (refresh path) flags
3. The web app then stores this access token on localstorage The endpoint
4. The user uses the app
5. In case of 401 Unauthorized response the app hits the `/refresh` endpoint and
   the browser automatically sends the cookie set on step 5
6. The REST API generates new keys of access/refresh token and invalidates the
   refresh token used
7. Repeat from step 2

![authorization-signin](./.assets/ses-drive-authorization-signin.drawio.png)

Also, since access/refresh tokens take the user id and token version, upon
changing the password, we increment the user token version, meaning all other
keys generated with the previous token version become invalid.

As a side note, the refresh token is encrypted with `aes-256-cbc` so that only
the server can unencrypt the token.

## Resource authorization

Since all authenticated users can access the protected endpoints, we require a
way of preventing users from accessing other users resources. We do that with a
access control list per resource. We devided this authorization into `owner`,
`read` and `write` access.

![authorization-resource](./.assets/ses-drive-authorization-resource.drawio.png)

# API Security

For the general security of the API, we added some layers to help mitigate
common attacks, namely:

- Wrap the API with the [Helmet](https://helmetjs.github.io/) package that helps
  preventing common attacks like Cross-site scripting, Mime-type sniffing and
  many others
- Provide a Rate Limitter per IP, where any given IP address is only allowed 500
  requests per 5 min
- Since we require a "no CORS" policy for the API key to be useful in any
  context outside of the app domain, every endpoint related to user account and
  authentication can only be accessed by a whitelisted domain, in this case, the
  web app

![api-security](./.assets/ses-drive-api-security.drawio.png)

# Files & Sharing

As files are only stored on S3, there is no way of adding file hierarchy easily,
unless it is on a "virtual" way.

The filesystem follows a composite pattern as presented by the Gang of Four. The
only more "hardcoded" variable is the `fullpath` of a file/directory. This is
used for a faster query on the database.

![filesystem](./.assets/ses-drive-filesystem.drawio.png)

Every file can only be either public or private. The only difference between the
two is that the public files can be accessed/downloaded by anyone. Each files
permissions applies, regardless if they are public or private.

Each file is stored in the public or private bucket, based on if they are public
or private. Although this happens, it is important to remember that, as stated
on the [AWS S3](#aws-s3) chapter, only the server has access to these buckets as
they are not open to public.

Files/Directories can only be shared by the owner. Giving/revoking any
permission to the directory recursively affects all children (files or
directories). Sharing is done via email address of an user.

Each user has its space on the public/private directory, normally separated
using the user's email address since it is unique.

![files](./.assets/ses-drive-filesystem-endpoints.drawio.png)

# Personal Page

The personal page is accomplished by serving the files directly from S3. Other
than that, public files/directories work exactly the same as private
files/directories. Permissions are granted by the owner and users can change
files and directories provided they were given the authorization by the owner.

The client makes a request to the `index.html` (example), the API checks with
the database if the file exists and returns the id on the S3 of the file. The
server then requests the S3 for the file and serves it to the client. All
communication between the client and the S3 always pass through the server.

![personal-page](./.assets/ses-drive-personal-age.drawio.png)

# Conclusion

Implementing a complete service like this is hard in every aspect, from having a hard project theme, to time constraints, to have to take into consideration security, design and reliability contraints for three diferent use cases was a challenge.

In the end we reached a robust solution, and ticked every requirement and request but reducing the scope or time contraints the solution could be improved and more security contraints could be addressed.

Taking everything into consideration was a hard challenge but completed with success, and with future work and implementing more functionalities it could be a in house Google Drive for the people don't trust other services with their data.
