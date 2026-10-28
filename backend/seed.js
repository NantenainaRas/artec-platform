require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connecté');

  const accounts = [
    { username: 'admin',     password: 'admin123',   role: 'admin' },
    { username: 'artec',     password: 'artec123',   role: 'artec' },
    { username: 'yas_user',  password: 'yas123',     role: 'yas' },
    { username: 'orange_user', password: 'orange123', role: 'orange' },
    { username: 'airtel_user', password: 'airtel123', role: 'airtel' }
  ];

  for (const acc of accounts) {
    const exists = await User.findOne({ username: acc.username });
    if (!exists) {
      await User.create({
        ...acc,
        operatorName: ['yas', 'orange', 'airtel'].includes(acc.role) ? acc.role : null
      });
      console.log(`✓ Créé : ${acc.username} / ${acc.password}`);
    } else {
      console.log(`= Existe déjà : ${acc.username}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
};

seed();