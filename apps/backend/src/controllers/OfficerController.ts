import { Request, Response } from 'express';
import { OfficerRepository } from '../models/OfficerRepository';
import { UserRepository } from '../models/UserRepository';
import { DepartmentRepository } from '../models/DepartmentRepository';
import { AuthenticatedRequest } from '../middlewares';
import { CreateOfficerData, UpdateOfficerData } from '../models/OfficerRepository';
import { UserRole } from '../types/database';

export class OfficerController {
  private officerRepository: OfficerRepository;
  private userRepository: UserRepository;
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.officerRepository = new OfficerRepository();
    this.userRepository = new UserRepository();
    this.departmentRepository = new DepartmentRepository();
  }

  // GET /api/officers - Public endpoint with pagination, filtering, and sorting
  getAllOfficers = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        department_id = '',
        position = '',
        sort_by = 'created_at',
        sort_order = 'asc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const departmentId = department_id ? parseInt(department_id as string, 10) : undefined;

      // Validate sort order
      const validSortOrder = sort_order === 'desc' ? 'desc' : 'asc';
      const validSortBy = ['position', 'created_at', 'updated_at'].includes(sort_by as string) 
        ? sort_by as string 
        : 'created_at';

      const { officers, count } = await this.officerRepository.findAllWithPagination(
        pageNum,
        limitNum,
        search as string,
        departmentId,
        position as string,
        validSortBy,
        validSortOrder
      );

      const totalPages = Math.ceil(count / limitNum);

      res.json({
        success: true,
        data: {
          officers,
          pagination: {
            current_page: pageNum,
            total_pages: totalPages,
            total_items: count,
            items_per_page: limitNum,
            has_next: pageNum < totalPages,
            has_prev: pageNum > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching officers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/officers/:id - Public endpoint
  getOfficerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const officerId = parseInt(id, 10);

      if (isNaN(officerId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid officer ID'
        });
        return;
      }

      const officer = await this.officerRepository.findWithDetails(officerId);

      if (!officer) {
        res.status(404).json({
          success: false,
          message: 'Officer not found'
        });
        return;
      }

      // Get officer stats for public display
      const stats = await this.officerRepository.getOfficerStats(officerId);

      res.json({
        success: true,
        data: {
          officer: {
            ...officer,
            stats
          }
        }
      });
    } catch (error) {
      console.error('Error fetching officer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/officers/department/:departmentId - Public endpoint to get officers by department
  getOfficersByDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { departmentId } = req.params;
      const deptId = parseInt(departmentId, 10);

      if (isNaN(deptId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
        return;
      }

      // Verify department exists
      const department = await this.departmentRepository.findById(deptId);
      if (!department) {
        res.status(404).json({
          success: false,
          message: 'Department not found'
        });
        return;
      }

      const officers = await this.officerRepository.findByDepartment(deptId);

      res.json({
        success: true,
        data: {
          officers,
          department: {
            id: department.id,
            name: department.name
          }
        }
      });
    } catch (error) {
      console.error('Error fetching officers by department:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/officers/service/:serviceId/available - Public endpoint to get available officers for a service
  getAvailableOfficersForService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const servId = parseInt(serviceId, 10);

      if (isNaN(servId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid service ID'
        });
        return;
      }

      const officers = await this.officerRepository.getAvailableOfficersForService(servId);

      res.json({
        success: true,
        data: {
          officers
        }
      });
    } catch (error) {
      console.error('Error fetching available officers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/officers - Admin only
  createOfficer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { user_id, department_id, position } = req.body;

      // Validate required fields
      if (!user_id || !department_id) {
        res.status(400).json({
          success: false,
          message: 'User ID and Department ID are required'
        });
        return;
      }

      const userId = parseInt(user_id, 10);
      const departmentIdNum = parseInt(department_id, 10);

      if (isNaN(userId) || isNaN(departmentIdNum)) {
        res.status(400).json({
          success: false,
          message: 'User ID and Department ID must be valid numbers'
        });
        return;
      }

      // Verify user exists and is not already an officer
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Check if user is already an officer
      const existingOfficer = await this.officerRepository.isUserAlreadyOfficer(userId);
      if (existingOfficer) {
        res.status(409).json({
          success: false,
          message: 'User is already an officer'
        });
        return;
      }

      // Verify department exists
      const department = await this.departmentRepository.findById(departmentIdNum);
      if (!department) {
        res.status(404).json({
          success: false,
          message: 'Department not found'
        });
        return;
      }

      // Validate user role (should be OFFICER role)
      if (user.role !== UserRole.OFFICER && user.role !== UserRole.ADMIN) {
        res.status(400).json({
          success: false,
          message: 'User must have Officer or Admin role to become an officer'
        });
        return;
      }

      const officerData: CreateOfficerData = {
        user_id: userId,
        department_id: departmentIdNum,
        position: position?.trim() || null
      };

      const newOfficer = await this.officerRepository.create(officerData);

      // Get the created officer with details
      const officerWithDetails = await this.officerRepository.findWithDetails(newOfficer.id);

      res.status(201).json({
        success: true,
        message: 'Officer created successfully',
        data: {
          officer: officerWithDetails
        }
      });
    } catch (error) {
      console.error('Error creating officer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /api/officers/:id - Admin only
  updateOfficer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const officerId = parseInt(id, 10);

      if (isNaN(officerId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid officer ID'
        });
        return;
      }

      const { department_id, position } = req.body;

      // Check if officer exists
      const existingOfficer = await this.officerRepository.findById(officerId);
      if (!existingOfficer) {
        res.status(404).json({
          success: false,
          message: 'Officer not found'
        });
        return;
      }

      // Validate department if provided
      if (department_id !== undefined) {
        const departmentIdNum = parseInt(department_id, 10);
        if (isNaN(departmentIdNum)) {
          res.status(400).json({
            success: false,
            message: 'Department ID must be a valid number'
          });
          return;
        }

        const department = await this.departmentRepository.findById(departmentIdNum);
        if (!department) {
          res.status(404).json({
            success: false,
            message: 'Department not found'
          });
          return;
        }
      }

      const updateData: UpdateOfficerData = {};
      if (department_id !== undefined) updateData.department_id = parseInt(department_id, 10);
      if (position !== undefined) updateData.position = position?.trim() || null;

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
        return;
      }

      const updatedOfficer = await this.officerRepository.update(officerId, updateData);

      // Get the updated officer with details
      const officerWithDetails = await this.officerRepository.findWithDetails(officerId);

      res.json({
        success: true,
        message: 'Officer updated successfully',
        data: {
          officer: officerWithDetails
        }
      });
    } catch (error) {
      console.error('Error updating officer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // DELETE /api/officers/:id - Admin only
  deleteOfficer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const officerId = parseInt(id, 10);

      if (isNaN(officerId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid officer ID'
        });
        return;
      }

      // Check if officer exists
      const existingOfficer = await this.officerRepository.findById(officerId);
      if (!existingOfficer) {
        res.status(404).json({
          success: false,
          message: 'Officer not found'
        });
        return;
      }

      // Check if officer has associated timeslots
      const hasTimeslots = await this.officerRepository.hasAssociatedTimeslots(officerId);
      if (hasTimeslots) {
        res.status(409).json({
          success: false,
          message: 'Cannot delete officer with associated timeslots. Please remove all timeslots first.'
        });
        return;
      }

      // Check if officer has associated appointments
      const hasAppointments = await this.officerRepository.hasAssociatedAppointments(officerId);
      if (hasAppointments) {
        res.status(409).json({
          success: false,
          message: 'Cannot delete officer with associated appointments. This officer has appointment history.'
        });
        return;
      }

      await this.officerRepository.delete(officerId);

      res.json({
        success: true,
        message: 'Officer deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting officer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/officers/search - Public endpoint for searching officers
  searchOfficers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query, department_id } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const departmentId = department_id ? parseInt(department_id as string, 10) : undefined;

      const officers = await this.officerRepository.search(query, departmentId);

      res.json({
        success: true,
        data: {
          officers,
          search_query: query,
          department_id: departmentId
        }
      });
    } catch (error) {
      console.error('Error searching officers:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/officers/me - Officer/Admin endpoint to get current user's officer profile
  getMyOfficerProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const userId = parseInt(req.user.id, 10);
      const officer = await this.officerRepository.findByUserId(userId);

      if (!officer) {
        res.status(404).json({
          success: false,
          message: 'Officer profile not found for current user'
        });
        return;
      }

      // Get officer stats
      const stats = await this.officerRepository.getOfficerStats(officer.id);

      res.json({
        success: true,
        data: {
          officer: {
            ...officer,
            stats
          }
        }
      });
    } catch (error) {
      console.error('Error fetching officer profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
