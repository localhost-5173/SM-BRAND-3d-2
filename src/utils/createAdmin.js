require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const AdminUser = require('../models/AdminUser');
const logger = require('./logger');

function askQuestion(query, isPassword = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    if (isPassword) {
      process.stdout.write(query);
      let pass = '';
      // Raw mode to mask input
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      const onData = (char) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          console.log();
          rl.close();
          resolve(pass);
        } else if (char === '\u0003') {
          // Ctrl+C
          process.exit(1);
        } else if (char === '\u0008' || char === '\x7f') {
          // Backspace
          if (pass.length > 0) {
            pass = pass.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          pass += char;
          process.stdout.write('*');
        }
      };

      process.stdin.on('data', onData);
    } else {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function runCreateAdmin() {
  logger.info('==============================================');
  logger.info('SM BRAND — CLI Administrator Account Creator');
  logger.info('==============================================');

  await connectDB();

  try {
    // 1. Prompt Name
    const nameInput = await askQuestion('Enter Administrator Name [SM Admin]: ');
    const name = nameInput || 'SM Admin';

    // 2. Prompt Email
    let email = '';
    while (!email) {
      const emailInput = await askQuestion('Enter Admin Email Address: ');
      if (!emailInput || !/^\S+@\S+\.\S+$/.test(emailInput)) {
        console.log('Error: Invalid email address format. Please enter a valid email.');
        continue;
      }

      // Check duplicate
      const existing = await AdminUser.findOne({ email: emailInput.toLowerCase() });
      if (existing) {
        console.log(`Error: An admin user with email '${emailInput}' already exists. Duplicates refused.`);
        continue;
      }

      email = emailInput.toLowerCase();
    }

    // 3. Prompt Password (min 10 chars)
    let password = '';
    while (!password) {
      const passInput = await askQuestion('Enter Admin Password (min 10 characters): ', true);
      if (!passInput || passInput.length < 10) {
        console.log('Error: Password must be at least 10 characters long.');
        continue;
      }
      const confirmInput = await askQuestion('Confirm Admin Password: ', true);
      if (passInput !== confirmInput) {
        console.log('Error: Passwords do not match. Please try again.');
        continue;
      }
      password = passInput;
    }

    // 4. Hash password with bcrypt (12 rounds)
    logger.info('Hashing password with bcrypt (cost 12)...');
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // 5. Save AdminUser
    const admin = await AdminUser.create({
      name: name,
      email: email,
      password_hash: password_hash,
      role: 'admin'
    });

    logger.info('==============================================');
    logger.info(`Administrator account created successfully!`);
    logger.info(`ID: ${admin._id}`);
    logger.info(`Name: ${admin.name}`);
    logger.info(`Email: ${admin.email}`);
    logger.info('==============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    logger.error('Failed to create admin account:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runCreateAdmin();
