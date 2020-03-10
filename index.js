#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const Nightmare = require("nightmare");

const nightmare = Nightmare({
  show: true,
  typeInterval: 10,
  waitTimeout: 25000,
  height: 1000,
  electronPath: require('electron')
});

function extractEmail(str) {
  return str.match(/([a-zA-Z0-9.\+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
}

async function deleteAccount(email) {
  await nightmare
    .goto("https://accounts.firefox.com")
    .wait(".email[name='email']")
    .type(".email[name='email']", email)

    .wait("#submit-btn")
    .click("#submit-btn")

    .wait("#password")
    .type("#password", process.env.TEST_ACCOUNT_PASSWORD)

    .wait("#submit-btn")
    .click("#submit-btn")

    .wait("#delete-account button.settings-unit-toggle")
    .click("#delete-account button.settings-unit-toggle")

    .wait("#delete-account-subscriptions")
    .wait(250)
    .click("#delete-account-subscriptions")
    .click("#delete-account-saved-info")
    .click("#delete-account-reactivate")

    .type("#password", process.env.TEST_ACCOUNT_PASSWORD)

    .click(".delete-account-button")

    .wait("#fxa-enter-email-header")
}

async function main() {
  const fileStream = fs.createReadStream(process.argv[2]);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const email = extractEmail(line);
    if (email) {
      console.log(`Processing account ${email}`);
      try {
        await deleteAccount(email)
      } catch {
        console.error(`Failed deleting ${email}`);
      }
    }
  }
}

main()
