const DB_CONSTS = require("../utils/env");
const { dbService } = require("./database.service");
const { FileSystemManager } = require("./file_system_manager");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * @typedef {Object} Reservation
 * @property {string} clientName - Nom du client.
 * @property {string} plateauId - Id du plateau réservé.
 * @property {string[]} itemIds - Items à réserver
 * @property {number} startTime - Début de la réservation en millisecondes.
 * @property {number} endTime - Fin de la réservation en millisecondes.
 */

class ReservationService {
  constructor() {
    this.JSON_PATH_ITEMS = path.join(__dirname, "../data/items.json");
    this.JSON_PATH_PLATEAUS = path.join(__dirname, "../data/plateaus.json");
    this.fileSystemManager = new FileSystemManager();
    this.dbService = dbService;
  }

  get reservationsCollection() {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_RESERVATIONS);
  }

  /**
   * TODO : Récupérer la collection des items
   */
  get itemsCollection() {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_ITEMS);
  }

  /**
   * TODO : Récupérer la collection des plateaux
   */
  get plateausCollection() {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_PLATEAUS);
  }

  /**
   * Remplir la collection avec les données du fichier JSON
   * Fonction fournie pour vous
   */
  async populateDb() {
    const items = JSON.parse(
      await this.fileSystemManager.readFile(this.JSON_PATH_ITEMS)
    ).items;
    const plateaus = JSON.parse(
      await this.fileSystemManager.readFile(this.JSON_PATH_PLATEAUS)
    ).plateaus;
    await this.dbService.populateDb(DB_CONSTS.DB_COLLECTION_ITEMS, items);
    await this.dbService.populateDb(DB_CONSTS.DB_COLLECTION_PLATEAUS, plateaus);
  }

  /**
   * TODO : Récupérer tous les items de la base de données
   * @returns {Promise<Object[]>} - Tous les items
   */
  async getAllItems() {
    return await this.itemsCollection.find().toArray();
  }

  /**
   * TODO : Récupérer un item par son identifiant
   * @param {string} itemId identifiant de l'item 
   */
  async getItemById(itemId) {
    return await this.itemsCollection.findOne({ id: itemId });
  }

  /**
   * TODO : Récupérer tous les plateaux de la base de données
   * @returns {Promise<Object[]>} - Tous les plateaux
   */
  async getAllPlateaus() {
    return await this.plateausCollection.find().toArray();
  }

  /**
   * TODO : Récupérer un plateau par son identifiant
   * @param {string} plateauId identifiant du plateau
   */
  async getPlateauById(plateauId) {
    return await this.plateausCollection.findOne({ id: plateauId });
  }

  /**
   * TODO : Vérifier la disponibilité d'un plateau pour une réservation en comparant les heures de début et de fin 
   * avec les réservations existantes
   * @param {string} plateauId identifiant du plateau
   * @param {number} startTime heure de début de la réservation en millisecondes
   * @param {number} endTime heure de fin de la réservation en millisecondes
   */
  async checkPlateauAvailability(plateauId, startTime, endTime) {
    const startISO = new Date(startTime).toISOString();
    const endISO = new Date(endTime).toISOString();
    
    const reservations = await this.getReservationsForPlateau(plateauId); 
  
    for (let reservation of reservations) {
      const reservationStart = new Date(reservation.startTime).toISOString();
      const reservationEnd = new Date(reservation.endTime).toISOString();
      
      const isOverlapping = (
        (startISO >= reservationStart && startISO < reservationEnd) || // New start time overlaps
        (endISO > reservationStart && endISO <= reservationEnd) ||   // New end time overlaps
        (startISO <= reservationStart && endISO >= reservationEnd)   // New reservation completely overlaps
      );
  
      if (isOverlapping) {
        return false;  
      }
    }

    return true;
  }

  /**
   * Récupérer toutes les réservations de la base de données
   */
  async getAllReservations() {
    return await this.reservationsCollection.find().toArray();
  }

  /**
   * TODO : Récupérer une réservation par son identifiant
   */
  async getReservationById(id) {  
    return await this.reservationsCollection.findOne({ _id: id });
  }

  async getReservationsForPlateau(plateauId) {
    return await this.reservationsCollection.find({ plateauId }).toArray();
  }

  /**
   * TODO : Ajouter une nouvelle réservation. 
   * TODO : Gérer le cas de données valides (voir les commentaires ci-dessous)
   * @throws {Error} - Si le plateau n'existe pas
   * @throws {Error} - Si un item n'est pas autorisé pour ce plateau
   * @throws {Error} - Si la plage horaire n'est pas disponible
   * @param {Reservation} reservationData - Les données de la réservation
   */
  async createReservation(reservationData) {
    const {
      plateauId,
      itemIds = [],
      startTime,
      endTime,
      clientName,
    } = reservationData;

    // TODO : Vérifer la validité du plateau, des items et de la plage horaire
    // Validation du plateau
    const plateau = await this.getPlateauById(plateauId);
    if (!plateau) throw new Error("Invalid plateau");

    // Validation des items
    const invalidItems = itemIds.filter(itemId => !plateau.allowedItems.includes(itemId));
    if (invalidItems.length > 0) {
      throw new Error("Some items are not allowed for this plateau");
    }

    // Validation de la disponibilité
    const isPlateauAvailable = await this.checkPlateauAvailability(plateauId, startTime, endTime);
    if (!isPlateauAvailable) {
      throw new Error("Requested time slot not available");
    }

    const reservation = {
      id: uuidv4(),
      plateauId,
      plateauName: plateau.name,
      clientName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      itemIds,
      createdAt: new Date(),
    };
    // TODO : Insérer la réservation dans la base de données
    await this.reservationsCollection.insertOne(reservation);

    return reservation;
  }

  /**
   * TODO : Supprimer une réservation par son identifiant
   * @param {string} id identifiant de la réservation
   * @returns {Promise<import("mongodb").DeleteResult>} - Résultat de la suppression
   */
  async deleteReservation(id) {
    return await this.reservationsCollection.deleteOne({ id: id });
  }
  

  /**
   * Réinitialiser la base de données en supprimant toutes les collections et en les remplissant à nouveau
   * Fonction fournie à des fins de débogage durant le développement
   */
  async resetDatabase() {
    await this.reservationsCollection.deleteMany({});
    await this.itemsCollection.deleteMany({});
    await this.plateausCollection.deleteMany({});
    await this.populateDb();
  }
}

const reservationService = new ReservationService();
module.exports = { reservationService };
