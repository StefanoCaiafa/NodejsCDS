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
 *               - movieId
 *             properties:
 *               movieId:
 *                 type: integer
 *                 description: The TMDB movie ID to add to favorites
 *                 example: 550
 *     responses:
 *       201:
 *         description: Movie added to favorites successfully. Movie details are fetched from TMDB and stored with addedAt timestamp.
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
 *         description: Bad request - Movie already in favorites or invalid movieId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Valid authentication token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Movie not found in TMDB database
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
