import { Router } from 'express';
import {
  createQuiz,
  deleteQuiz,
  getQuizById,
  getQuizzes,
} from '../controllers/quizController.js';

const router = Router();

router.get('/', getQuizzes);
router.get('/:id', getQuizById);

router.post('/', createQuiz);
router.delete('/:id', deleteQuiz);

export default router;
