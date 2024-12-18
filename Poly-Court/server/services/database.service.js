const { MongoClient, ServerApiVersion } = require('mongodb');
const DB_CONSTS = require('../utils/env');

class DatabaseService {
  /**
   * TODO : Remplir la collection avec les données seulement si elle est vide
   * @param {string} collectionName nom de la collection sur MongoDB
   * @param {Array} data tableau contenant les documents à mettre dans la collection
   */
  async populateDb(collectionName, data) {
    try {
      const collection = this.db.collection(collectionName);
      // Vérification de type et non-vide
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Les données doivent être un tableau non vide.');
      }
      const count = await collection.countDocuments();
      if (count === 0) {
        await collection.insertMany(data);
        console.log(`Données insérées dans la collection ${collectionName}`);
      } else {
        console.log(`La collection ${collectionName} contient déjà des données.`);
      }
    } catch (error) {
      console.error(`Erreur lors de la population de la collection ${collectionName}:`, error); 
      throw error; 
    }
  }

  /**
   * Établir la connection avec la base de données MongoDB
   * @param {string} uri URI de la base de données MongoDB 
   */
  async connectToServer(uri) {
    try {
      this.client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      await this.client.connect();
      this.db = this.client.db(DB_CONSTS.DB_DB);
      // eslint-disable-next-line no-console
      console.log('Successfully connected to MongoDB.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

const dbService = new DatabaseService();

module.exports = { dbService };