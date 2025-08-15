import { Request, Response } from 'express';
import { DepartmentRepository } from '../models/DepartmentRepository';
import { AuthenticatedRequest } from '../middlewares';
import { CreateDepartmentData } from '../types/database';

export class DepartmentController {
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.departmentRepository = new DepartmentRepository();
  }

  // GET /api/departments - Public endpoint with pagination, filtering, and sorting
  getAllDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        sort_by = 'name',
        sort_order = 'asc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      // Validate sort order
      const validSortOrder = sort_order === 'desc' ? 'desc' : 'asc';
      const validSortBy = ['name', 'created_at', 'updated_at'].includes(sort_by as string) 
        ? sort_by as string 
        : 'name';

      const { departments, count } = await this.departmentRepository.findAllWithPagination(
        pageNum,
        limitNum,
        search as string,
        validSortBy,
        validSortOrder
      );

      const totalPages = Math.ceil(count / limitNum);

      res.json({
        success: true,
        data: {
          departments,
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
      console.error('Error fetching departments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/departments/:id - Public endpoint
  getDepartmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const departmentId = parseInt(id, 10);

      if (isNaN(departmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
        return;
      }

      const department = await this.departmentRepository.findById(departmentId);

      if (!department) {
        res.status(404).json({
          success: false,
          message: 'Department not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          department
        }
      });
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/departments - Admin/Superadmin only
  createDepartment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, description, contact_email, contact_phone, address } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Department name is required'
        });
        return;
      }

      // Check if department name already exists
      const existingDepartment = await this.departmentRepository.findByName(name.trim());
      if (existingDepartment) {
        res.status(409).json({
          success: false,
          message: 'Department with this name already exists'
        });
        return;
      }

      // Validate email format if provided
      if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const departmentData: CreateDepartmentData = {
        name: name.trim(),
        description: description?.trim() || null,
        contact_email: contact_email?.trim() || null,
        contact_phone: contact_phone?.trim() || null,
        address: address?.trim() || null
      };

      const newDepartment = await this.departmentRepository.create(departmentData);

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: {
          department: newDepartment
        }
      });
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /api/departments/:id - Admin/Superadmin only
  updateDepartment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const departmentId = parseInt(id, 10);

      if (isNaN(departmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
        return;
      }

      const { name, description, contact_email, contact_phone, address } = req.body;

      // Check if department exists
      const existingDepartment = await this.departmentRepository.findById(departmentId);
      if (!existingDepartment) {
        res.status(404).json({
          success: false,
          message: 'Department not found'
        });
        return;
      }

      // Validate name if provided
      if (name !== undefined) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          res.status(400).json({
            success: false,
            message: 'Department name cannot be empty'
          });
          return;
        }

        // Check if new name conflicts with existing department
        const nameConflict = await this.departmentRepository.isNameTaken(name.trim(), departmentId);
        if (nameConflict) {
          res.status(409).json({
            success: false,
            message: 'Department with this name already exists'
          });
          return;
        }
      }

      // Validate email format if provided
      if (contact_email !== undefined && contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description?.trim() || null;
      if (contact_email !== undefined) updateData.contact_email = contact_email?.trim() || null;
      if (contact_phone !== undefined) updateData.contact_phone = contact_phone?.trim() || null;
      if (address !== undefined) updateData.address = address?.trim() || null;

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
        return;
      }

      const updatedDepartment = await this.departmentRepository.update(departmentId, updateData);

      res.json({
        success: true,
        message: 'Department updated successfully',
        data: {
          department: updatedDepartment
        }
      });
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // DELETE /api/departments/:id - Admin/Superadmin only
  deleteDepartment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const departmentId = parseInt(id, 10);

      if (isNaN(departmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid department ID'
        });
        return;
      }

      // Check if department exists
      const existingDepartment = await this.departmentRepository.findById(departmentId);
      if (!existingDepartment) {
        res.status(404).json({
          success: false,
          message: 'Department not found'
        });
        return;
      }

      // Check if department has associated services or officers
      const hasServices = await this.departmentRepository.hasAssociatedServices(departmentId);
      if (hasServices) {
        res.status(409).json({
          success: false,
          message: 'Cannot delete department with associated services. Please remove all services first.'
        });
        return;
      }

      const hasOfficers = await this.departmentRepository.hasAssociatedOfficers(departmentId);
      if (hasOfficers) {
        res.status(409).json({
          success: false,
          message: 'Cannot delete department with associated officers. Please remove all officers first.'
        });
        return;
      }

      await this.departmentRepository.delete(departmentId);

      res.json({
        success: true,
        message: 'Department deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
