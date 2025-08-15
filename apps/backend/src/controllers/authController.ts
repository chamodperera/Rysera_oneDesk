// Authentication controller for the Government Appointment Booking System
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../models/UserRepository';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { EmailService } from '../utils/email';
import { AuthenticatedRequest } from '../middlewares';
import { UserRole, CreateUserData } from '../types/database';
import jwt from 'jsonwebtoken';
import config from '../config';

export class AuthController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // User registration
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, first_name, last_name, phone_number, role = 'citizen' } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name || !phone_number) {
        res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
        return;
      }

      // Validate role - only admin can create non-citizen users
      if (role !== 'citizen') {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
          res.status(403).json({
            success: false,
            message: 'Only admins can create officer or admin accounts'
          });
          return;
        }
      }

      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
        return;
      }

      // Check if phone number already exists
      const existingPhone = await this.userRepository.findByPhoneNumber(phone_number);
      if (existingPhone) {
        res.status(409).json({
          success: false,
          message: 'Phone number already registered'
        });
        return;
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Create user data
      const userData: CreateUserData = {
        email,
        password_hash,
        first_name,
        last_name,
        phone_number,
        role: role as UserRole
      };

      // Create user
      const newUser = await this.userRepository.create(userData);

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(email, `${first_name} ${last_name}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      // Generate JWT token
      const token = generateToken({
        id: newUser.id.toString(),
        email: newUser.email,
        role: newUser.role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone_number: newUser.phone_number,
            role: newUser.role,
            created_at: newUser.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  };

  // User login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check if user has password_hash
      if (!user.password_hash) {
        res.status(401).json({
          success: false,
          message: 'Account setup incomplete. Please contact administrator.'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id.toString(),
        email: user.email,
        role: user.role
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  };

  // Request password reset
  requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        res.status(200).json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
        return;
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { 
          userId: user.id.toString(),
          email: user.email,
          type: 'password_reset'
        },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      // Send password reset email
      try {
        await EmailService.sendPasswordResetEmail(user.email, resetToken);
        
        res.status(200).json({
          success: true,
          message: 'Password reset email sent successfully'
        });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        res.status(500).json({
          success: false,
          message: 'Failed to send password reset email'
        });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Reset password
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
        return;
      }

      // Verify reset token
      let decoded: any;
      try {
        decoded = jwt.verify(token, config.jwtSecret);
      } catch (tokenError) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
        return;
      }

      // Verify token type
      if (decoded.type !== 'password_reset') {
        res.status(400).json({
          success: false,
          message: 'Invalid token type'
        });
        return;
      }

      // Find user
      const user = await this.userRepository.findByEmail(decoded.email);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await this.userRepository.updatePassword(user.id, newPasswordHash);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Get current user profile
  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const user = await this.userRepository.findById(parseInt(req.user.id));
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Update current user profile
  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { first_name, last_name, phone_number } = req.body;
      const userId = parseInt(req.user.id);

      // Check if phone number is being changed and if it's already taken
      if (phone_number) {
        const isPhoneTaken = await this.userRepository.isPhoneNumberTaken(phone_number, userId);
        if (isPhoneTaken) {
          res.status(409).json({
            success: false,
            message: 'Phone number already in use'
          });
          return;
        }
      }

      // Update user
      const updateData: any = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (phone_number) updateData.phone_number = phone_number;

      const updatedUser = await this.userRepository.update(userId, updateData);

      if (!updatedUser) {
        res.status(500).json({
          success: false,
          message: 'Failed to update profile'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            phone_number: updatedUser.phone_number,
            role: updatedUser.role,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Change password
  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
        return;
      }

      const userId = parseInt(req.user.id);
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Check if user has password_hash
      if (!user.password_hash) {
        res.status(400).json({
          success: false,
          message: 'Account setup incomplete. Please contact administrator.'
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await this.userRepository.updatePassword(userId, newPasswordHash);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
