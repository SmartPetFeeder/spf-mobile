require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-for-jwt-tokens-1234567890';

module.exports = (req, res, next) => {
  // Activer CORS pour tous les domaines
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  // ============ ROUTES NOTIFICATIONS (priorité haute) ============
  // CRUD pour notifications - Création
  if (req.path === '/notifications' && req.method === 'POST') {
    const newNotification = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    req.app.db.get('notifications').push(newNotification).write();

    return res.json({
      message: 'Notification ajoutée avec succès',
      notification: newNotification,
    });
  }

  // CRUD pour notifications - Mise à jour par ID string ou numérique
  if (req.path.match(/^\/notifications\/[\w-]+$/) && req.method === 'PUT') {
    const id = req.path.split('/')[2];
    const notification = req.app.db.get('notifications').find({ id }).value();

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    const updatedNotification = {
      ...notification,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    req.app.db.get('notifications').find({ id }).assign(updatedNotification).write();

    return res.json({
      message: 'Notification mise à jour avec succès',
      notification: updatedNotification,
    });
  }

  // CRUD pour notifications - Marquer comme lue (PATCH)
  if (req.path.match(/^\/notifications\/[\w-]+$/) && req.method === 'PATCH') {
    const id = req.path.split('/')[2];
    const notification = req.app.db.get('notifications').find({ id }).value();

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    const updatedNotification = {
      ...notification,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    req.app.db.get('notifications').find({ id }).assign(updatedNotification).write();

    return res.json({
      message: 'Notification mise à jour avec succès',
      notification: updatedNotification,
    });
  }

  // CRUD pour notifications - Suppression par ID string ou numérique
  if (req.path.match(/^\/notifications\/[\w-]+$/) && req.method === 'DELETE') {
    const id = req.path.split('/')[2];
    const notification = req.app.db.get('notifications').find({ id }).value();

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    req.app.db.get('notifications').remove({ id }).write();

    return res.json({
      message: 'Notification supprimée avec succès',
    });
  }

  // ============ AUTRES ROUTES ============

  // Route de connexion personnalisée
  if (req.path === '/auth/login' && req.method === 'POST') {
    const { email, password } = req.body;

    // Simulation de vérification utilisateur
    const user = req.app.db.get('users').find({ email }).value();

    if (!user || user.password !== password) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: '24h',
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }

  // Route d'inscription personnalisée
  if (req.path === '/auth/register' && req.method === 'POST') {
    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = req.app.db.get('users').find({ email }).value();

    if (existingUser) {
      return res.status(400).json({
        error: 'Un compte avec cet email existe déjà',
      });
    }

    // Créer nouvel utilisateur
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // En production, hasher le mot de passe
      createdAt: new Date().toISOString(),
    };

    req.app.db.get('users').push(newUser).write();

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, SECRET_KEY, {
      expiresIn: '24h',
    });

    return res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  }

  // Route de mot de passe oublié
  if (req.path === '/auth/forgot-password' && req.method === 'POST') {
    const { email } = req.body;

    const user = req.app.db.get('users').find({ email }).value();

    if (!user) {
      return res.status(404).json({
        error: 'Aucun compte trouvé avec cet email',
      });
    }

    // Simulation d'envoi d'email
    return res.json({
      message: 'Email de réinitialisation envoyé avec succès',
    });
  }

  // Route de distribution immédiate
  if (req.path === '/meals/distribute-now' && req.method === 'POST') {
    const newDistribution = {
      id: Date.now(),
      animalId: 1, // Par défaut Piper
      mealId: null, // Distribution manuelle
      plannedQuantity: 60,
      actualQuantity: 58,
      distributedAt: new Date().toISOString(),
      duration: 45,
      success: true,
    };

    req.app.db.get('distributions').push(newDistribution).write();

    return res.json({
      message: 'Distribution en cours...',
      distribution: newDistribution,
    });
  }

  // Route de calibrage
  if (req.path === '/distributor/calibrate' && req.method === 'POST') {
    return res.json({
      message: 'Calibrage terminé avec succès',
      calibratedAt: new Date().toISOString(),
    });
  }

  // Route de mise à jour firmware
  if (req.path === '/firmware/update' && req.method === 'POST') {
    return res.json({
      message: 'Mise à jour installée avec succès',
      newVersion: '2.4.2',
      updatedAt: new Date().toISOString(),
    });
  }

  // CRUD pour animaux - Création
  if (req.path === '/animals' && req.method === 'POST') {
    const newAnimal = {
      id: Date.now(),
      userId: req.userId || 1,
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    req.app.db.get('animals').push(newAnimal).write();

    return res.json({
      message: 'Animal ajouté avec succès',
      animal: newAnimal,
    });
  }

  // CRUD pour animaux - Mise à jour
  if (req.path.match(/^\/animals\/\d+$/) && req.method === 'PUT') {
    const id = parseInt(req.path.split('/')[2]);
    const animal = req.app.db.get('animals').find({ id }).value();

    if (!animal) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }

    const updatedAnimal = {
      ...animal,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    req.app.db.get('animals').find({ id }).assign(updatedAnimal).write();

    return res.json({
      message: 'Animal modifié avec succès',
      animal: updatedAnimal,
    });
  }

  // CRUD pour animaux - Suppression
  if (req.path.match(/^\/animals\/\d+$/) && req.method === 'DELETE') {
    const id = parseInt(req.path.split('/')[2]);
    const animal = req.app.db.get('animals').find({ id }).value();

    if (!animal) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }

    // Supprimer aussi les repas associés à cet animal
    req.app.db.get('meals').remove({ animalId: id }).write();
    req.app.db.get('statistics').remove({ animalId: id }).write();
    req.app.db.get('distributions').remove({ animalId: id }).write();

    // Supprimer l'animal
    req.app.db.get('animals').remove({ id }).write();

    return res.json({
      message: 'Animal et données associées supprimés avec succès',
    });
  }
  if (req.path === '/distributorStatus' && req.method === 'POST') {
    const newDistributor = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    req.app.db.get('distributorStatus').push(newDistributor).write();

    return res.json({
      message: 'Mangeoire ajoutée avec succès',
      distributor: newDistributor,
    });
  }

  // CRUD pour mangeoires - Création
  if (req.path === '/distributorStatus' && req.method === 'POST') {
    const newDistributor = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    req.app.db.get('distributorStatus').push(newDistributor).write();

    return res.json({
      message: 'Mangeoire ajoutée avec succès',
      distributor: newDistributor,
    });
  }

  // CRUD pour mangeoires - Mise à jour
  if (req.path.match(/^\/distributorStatus\/\d+$/) && req.method === 'PUT') {
    const id = parseInt(req.path.split('/')[2]);
    const distributor = req.app.db.get('distributorStatus').find({ id }).value();

    if (!distributor) {
      return res.status(404).json({ error: 'Mangeoire non trouvée' });
    }

    const updatedDistributor = {
      ...distributor,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    req.app.db.get('distributorStatus').find({ id }).assign(updatedDistributor).write();

    return res.json({
      message: 'Mangeoire mise à jour avec succès',
      distributor: updatedDistributor,
    });
  }

  // CRUD pour mangeoires - Suppression
  if (req.path.match(/^\/distributorStatus\/\d+$/) && req.method === 'DELETE') {
    const id = parseInt(req.path.split('/')[2]);
    const distributor = req.app.db.get('distributorStatus').find({ id }).value();

    if (!distributor) {
      return res.status(404).json({ error: 'Mangeoire non trouvée' });
    }

    req.app.db.get('distributorStatus').remove({ id }).write();

    return res.json({
      message: 'Mangeoire supprimée avec succès',
    });
  }

  // CRUD pour notifications - Création
  if (req.path === '/notifications' && req.method === 'POST') {
    const newNotification = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    req.app.db.get('notifications').push(newNotification).write();

    return res.json({
      message: 'Notification ajoutée avec succès',
      notification: newNotification,
    });
  }

  // CRUD pour notifications - Mise à jour par ID string ou numérique
  if (req.path.match(/^\/notifications\/[\w-]+$/) && req.method === 'PUT') {
    const id = req.path.split('/')[2];
    const notification = req.app.db.get('notifications').find({ id }).value();

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    const updatedNotification = {
      ...notification,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    req.app.db.get('notifications').find({ id }).assign(updatedNotification).write();

    return res.json({
      message: 'Notification mise à jour avec succès',
      notification: updatedNotification,
    });
  }

  // CRUD pour notifications - Marquer comme lue (PATCH)
  if (req.path.match(/^\/notifications\/[\w-]+$/) && req.method === 'PATCH') {
    const id = req.path.split('/')[2];
    const notification = req.app.db.get('notifications').find({ id }).value();

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    const updatedNotification = {
      ...notification,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    req.app.db.get('notifications').find({ id }).assign(updatedNotification).write();

    return res.json({
      message: 'Notification mise à jour avec succès',
      notification: updatedNotification,
    });
  }

  // CRUD pour notifications - Suppression par ID string ou numérique
  if (req.path.match(/^\/notifications\/[\w-]+$/) && req.method === 'DELETE') {
    const id = req.path.split('/')[2];
    const notification = req.app.db.get('notifications').find({ id }).value();

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    req.app.db.get('notifications').remove({ id }).write();

    return res.json({
      message: 'Notification supprimée avec succès',
    });
  }

  // Récupérer notifications par userId
  if (
    req.path.startsWith('/api/') ||
    (req.path.startsWith('/') &&
      !req.path.startsWith('/auth/') &&
      !req.path.startsWith('/planning') &&
      !req.path.startsWith('/meals') &&
      req.method !== 'GET')
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: "Token d'authentification requis",
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.userId = decoded.userId;
    } catch (_error) {
      return res.status(401).json({
        error: 'Token invalide',
      });
    }
  }

  // Continuer vers json-server
  next();
};
