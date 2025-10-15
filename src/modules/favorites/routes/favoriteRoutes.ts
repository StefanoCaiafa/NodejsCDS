import { Router } from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { FavoriteService } from '../services/FavoriteService';
import { FavoriteRepository } from '../../../core/data/FavoriteRepository';
import { authMiddleware } from '../../../middleware/authMiddleware';

const favoriteRepository = new FavoriteRepository();
const favoriteService = new FavoriteService(favoriteRepository);
const favoriteController = new FavoriteController(favoriteService);

const router = Router();

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Add a movie to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - title
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 550
 *               title:
 *                 type: string
 *                 example: Fight Club
 *               overview:
 *                 type: string
 *               poster_path:
 *                 type: string
 *               release_date:
 *                 type: string
 *               vote_average:
 *                 type: number
 *     responses:
 *       201:
 *         description: Movie added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Bad request - Movie already in favorites or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/favorites', authMiddleware, favoriteController.addFavorite);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get all user favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/favorites', authMiddleware, favoriteController.getFavorites);

/**
 * @swagger
 * /api/favorites/{movieId}:
 *   delete:
 *     summary: Remove a movie from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Movie ID to remove from favorites
 *         example: 550
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/favorites/:movieId', authMiddleware, favoriteController.removeFavorite);

export default router;
