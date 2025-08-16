// Base controller classes and interfaces
import { Request, Response, NextFunction } from 'express';

export interface IController {
  create?(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAll?(req: Request, res: Response, next: NextFunction): Promise<void>;
  getById?(req: Request, res: Response, next: NextFunction): Promise<void>;
  update?(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete?(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export abstract class BaseController {
  // Optional implementations can be added by subclasses
  async create?(req: Request, res: Response, next: NextFunction): Promise<void>;
  async getAll?(req: Request, res: Response, next: NextFunction): Promise<void>;
  async getById?(req: Request, res: Response, next: NextFunction): Promise<void>;
  async update?(req: Request, res: Response, next: NextFunction): Promise<void>;
  async delete?(req: Request, res: Response, next: NextFunction): Promise<void>;

  protected handleError(res: Response, error: any, message: string = 'Internal server error') {
    console.error(error);
    return res.status(500).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  protected handleSuccess(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }
}

// Export controllers
export { AuthController } from './authController';
export { UserController } from './userController';
export { DepartmentController } from './DepartmentController';

// Controllers will be implemented in future phases:
// - ServiceController
// - OfficerController
// - TimeslotController
// - AppointmentController
// - DocumentController
// - NotificationController
// - FeedbackController
