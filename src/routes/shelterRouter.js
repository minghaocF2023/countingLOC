
/**
 * @swagger
 * /shelters/username:
 *   get:
 *     tags: [shelters]
 *     summary: get all nearby shelters of a user
 *     description: get all nearby shelters of a user
 */
import express from 'express';
import ShelterController from '../controllers/shelterController.js';
import { 
    userModel, 
    testUserModel, 
    shelterModel, 
    testShelterModel 
} from '../models/models.js';

const router = express.Router(); 
const shelterController = new ShelterController(userModel, shelterModel);
const testShelterController = new ShelterController(testUserModel, testShelterModel)
// const testShelterController = new 

/**
 * @swagger
 * /shelters:
 *   get:
 *     tags: [shelters]
 *     summary: Get all shelters
 *     description: Get all currently created shelters
 */
router.get('/', (req, res) => {
    if (req.query.istest === 'true') {
        testShelterController.getAllShelters(req, res);
    } else {
        shelterController.getAllShelters(req, res);
    }
});

/**
 * @swagger
 * /shelters:
 *   post:
 *     tags: [shelters]
 *     summary: create a new shelter
 *     description: create a new shelter
 */
router.post('/', (req, res) => {
    if (req.query.istest === 'true') {
        testShelterController.createNewShelter(req, res);
    } else {
        shelterController.createNewShelter(req, res);
    }
});


/**
 * @swagger
 * /shelters/shelterId:
 *   put:
 *     tags: [shelters]
 *     summary: modify an existing shelter
 *     description: modify an existing shelter
 */
router.put('/:shelterId', (req, res) => {
    if (req.query.istest === 'true') {
        testShelterController.updateShelter(req, res);
    } else {
        shelterController.updateShelter(req, res);
    }
});


router.get('/:id/info', async (req, res) => {
    try {
        const shelterId = req.params.id;
        const shelter = await shelterModel.findById(shelterId);
        if (!shelter) {
            return res.status(404).send('Shelter not found');
        }
        res.render('shelterInfo', { shelter }); // Render the shelter info page
    } catch (error) {
        res.status(500).send('Server error');
    }
});

/**
 * @swagger
 * /shelters/shelterID:
 *   delete:
 *     tags: [shelters]
 *     summary: delete a new shelter
 *     description: delete a new shelter
 */
router.delete('/:shelterId', (req, res) => {
    if (req.query.istest === 'true') {
        testShelterController.deleteShelter(req, res);
    } else {
        shelterController.deleteShelter(req, res);
    }
});

export default router;