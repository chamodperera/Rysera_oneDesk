// User management controller for admin operations
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../models/UserRepository';
import { hashPassword } from '../utils/auth';
import { EmailService } from '../utils/email';
import { AuthenticatedRequest } from '../middlewares';
import { UserRole, CreateUserData, UpdateUserData } from '../types/database';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Get all users (Admin only)
  getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        role, 
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Get all users using the repository
      const allUsers = await this.userRepository.findAll();

      // Apply filters
      let filteredUsers = allUsers;
      
      if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.first_name.toLowerCase().includes(searchLower) ||
          user.last_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const startIndex = offset;
      const endIndex = offset + limitNum;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      const totalItems = filteredUsers.length;
      const totalPages = Math.ceil(totalItems / limitNum);

      res.status(200).json({
        success: true,
        data: {
          users: paginatedUsers.map(user => ({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
          })),
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Get user by ID (Admin only)
  getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      const user = await this.userRepository.findById(userId);
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
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Create user (Admin only)
  createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, first_name, last_name, phone_number, role } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name || !phone_number || !role) {
        res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
        return;
      }

      // Validate role
      const validRoles = [UserRole.CITIZEN, UserRole.OFFICER, UserRole.ADMIN];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
        return;
      }

      // Only admin can create admin users
      if (role === UserRole.ADMIN && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Only admin can create admin users'
        });
        return;
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
        // Don't fail user creation if email fails
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone_number: newUser.phone_number,
            role: newUser.role,
            created_at: newUser.created_at
          }
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Get users by role (Admin only)
  getUsersByRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role } = req.params;

      if (![UserRole.CITIZEN, UserRole.OFFICER, UserRole.ADMIN].includes(role as UserRole)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
        return;
      }

      const users = await this.userRepository.findByRole(role as UserRole);

      res.status(200).json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
          }))
        }
      });
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Update user (Admin only)
  updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { first_name, last_name, phone_number, role } = req.body;

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      // Find existing user
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Check role permissions
      if (role && role === UserRole.ADMIN && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Only admin can assign admin role'
        });
        return;
      }

      // Prevent admin demotion by non-admin
      if (existingUser.role === UserRole.ADMIN && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Only admin can modify admin users'
        });
        return;
      }

      // Check if phone number is being changed and if it's already taken
      if (phone_number && phone_number !== existingUser.phone_number) {
        const isPhoneTaken = await this.userRepository.isPhoneNumberTaken(phone_number, userId);
        if (isPhoneTaken) {
          res.status(409).json({
            success: false,
            message: 'Phone number already in use'
          });
          return;
        }
      }

      // Build update data
      const updateData: UpdateUserData = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (phone_number) updateData.phone_number = phone_number;
      if (role && [UserRole.CITIZEN, UserRole.OFFICER, UserRole.ADMIN].includes(role)) {
        updateData.role = role as UserRole;
      }

      // Update user
      const updatedUser = await this.userRepository.update(userId, updateData);

      if (!updatedUser) {
        res.status(500).json({
          success: false,
          message: 'Failed to update user'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
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
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Delete user (Admin only)
  deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      // Find existing user
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Prevent self-deletion
      if (userId.toString() === req.user?.id) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
        return;
      }

      // Delete user
      const deleted = await this.userRepository.delete(userId);
      if (!deleted) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete user'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}