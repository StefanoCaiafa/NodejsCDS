import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AuthService } from '../services/AuthService';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { LoginRequestDto } from '../dtos/LoginRequestDto';
import { ResponseBuilder } from '../../../utils/responseBuilder';
import { AuthRequest } from '../../../middleware/authMiddleware';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = plainToClass(RegisterUserDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map((err) => Object.values(err.constraints || {})).flat();
        ResponseBuilder.error(res, errorMessages.join(', '), 400);
        return;
      }

      const user = await this.authService.register(dto);

      ResponseBuilder.created(res, user, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = plainToClass(LoginRequestDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map((err) => Object.values(err.constraints || {})).flat();
        ResponseBuilder.error(res, errorMessages.join(', '), 400);
        return;
      }

      const result = await this.authService.login(dto);

      ResponseBuilder.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const userId = req.user?.userId;

      if (!token || !userId) {
        ResponseBuilder.unauthorized(res, 'Invalid authentication');
        return;
      }

      await this.authService.logout(token, userId);

      ResponseBuilder.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };
}
