import { Router } from 'express';
import {
  getItems,
  getItemById,
  getItemBids,
  getServerTime,
  healthCheck
} from '../controllers/itemController.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/time', getServerTime);
router.get('/items', getItems);
router.get('/items/:id', getItemById);
router.get('/items/:id/bids', getItemBids);

export default router;