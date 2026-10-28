const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!['yas', 'orange', 'airtel', 'artec', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const user = await User.create({
      username,
      password,
      role,
      operatorName: ['yas', 'orange', 'airtel'].includes(role) ? role : null
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      operatorName: user.operatorName,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      operatorName: user.operatorName,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.me = async (req, res) => {
  res.json(req.user);
};

exports.listUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    user.role = role;
    user.operatorName = ['yas', 'orange', 'airtel'].includes(role) ? role : null;
    await user.save();
    res.json({ _id: user._id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};