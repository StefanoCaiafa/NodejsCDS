import { Router } from 'express';
import { MovieController } from '../controllers/MovieController';
import { MovieService } from '../services/MovieService';
import { authMiddleware } from '../../../middleware/authMiddleware';

const movieService = new MovieService();
const movieController = new MovieController(movieService);

const router = Router();

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Search movies from TheMovieDB
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: false
 *         description: Search keyword for movies (optional)
 *         example: fight club
 *     responses:
 *       200:
 *         description: Movies retrieved successfully
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
 *                         $ref: '#/components/schemas/Movie'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/movies', authMiddleware, movieController.searchMovies);

export default router;
