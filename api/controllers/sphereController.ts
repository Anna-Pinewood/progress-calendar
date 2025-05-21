import { Request, Response } from 'express';
import * as sphereService from '../services/sphereService';

export const getSpheres = async (req: Request, res: Response) => {
    try {
        const spheres = await sphereService.getAllSpheres();
        res.json(spheres);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching spheres', error: error.message });
    }
};

export const createNewSphere = async (req: Request, res: Response) => {
    const { name, color, position } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Sphere name is required' });
    }
    try {
        const newSphere = await sphereService.createSphere(name, color, position);
        res.status(201).json(newSphere);
    } catch (error: any) {
        if (error.message === 'Sphere with this name already exists') {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating sphere', error: error.message });
    }
};

export const updateExistingSphere = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { color, position } = req.body;

    if (color === undefined && position === undefined) {
        return res.status(400).json({ message: 'At least one field (color or position) must be provided for update' });
    }

    try {
        const sphereId = parseInt(id, 10);
        if (isNaN(sphereId)) {
            return res.status(400).json({ message: 'Invalid sphere ID' });
        }
        const updatedSphere = await sphereService.updateSphere(sphereId, color, position);
        if (updatedSphere) {
            res.json(updatedSphere);
        } else {
            res.status(404).json({ message: 'Sphere not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating sphere', error: error.message });
    }
}; 