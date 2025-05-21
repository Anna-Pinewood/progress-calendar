import { Router } from 'express';
import * as sphereController from '../controllers/sphereController';

const router = Router();

router.post('/', sphereController.createNewSphere);
router.get('/', sphereController.getSpheres);
router.patch('/:id', sphereController.updateExistingSphere);

export default router; 