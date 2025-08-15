import { Request, Response } from 'express';
import { ServiceRepository } from '../models/ServiceRepository';
import { DepartmentRepository } from '../models/DepartmentRepository';
import { AuthenticatedRequest } from '../middlewares';
import { CreateServiceData } from '../types/database';

export class ServiceController {
  private serviceRepository: ServiceRepository;
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.serviceRepository = new ServiceRepository();
    this.departmentRepository = new DepartmentRepository();
  }

  // GET /api/services - Public endpoint with pagination, filtering, and sorting
  getAllServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        department_id = '',
        sort_by = 'name',
        sort_order = 'asc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const departmentId = department_id ? parseInt(department_id as string, 10) : undefined;

      // Validate sort order
      const validSortOrder = sort_order === 'desc' ? 'desc' : 'asc';
      const validSortBy = ['name', 'created_at', 'updated_at', 'duration_minutes'].includes(sort_by as string) 
        ? sort_by as string 
        : 'name';

      const { services, count } = await this.serviceRepository.findAllWithPagination(
        pageNum,
        limitNum,
        search as string,
        departmentId,
        validSortBy,
        validSortOrder
      );

      const totalPages = Math.ceil(count / limitNum);

      res.json({
        success: true,
        data: {
          services,
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
      console.error('Error fetching services:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/services/:id - Public endpoint
  getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const serviceId = parseInt(id, 10);

      if (isNaN(serviceId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid service ID'
        });
        return;
      }

      const service = await this.serviceRepository.findWithDepartment(serviceId);

      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found'
        });
        return;
      }

      // Get service stats for public display
      const stats = await this.serviceRepository.getServiceStats(serviceId);

      res.json({
        success: true,
        data: {
          service: {
            ...service,
            stats
          }
        }
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/services/department/:departmentId - Public endpoint to get services by department
  getServicesByDepartment = async (req: Request, res: Response): Promise<void> => {
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

      const services = await this.serviceRepository.findByDepartment(deptId);

      res.json({
        success: true,
        data: {
          services,
          department: {
            id: department.id,
            name: department.name
          }
        }
      });
    } catch (error) {
      console.error('Error fetching services by department:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/services - Officer/Admin only
  createService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { department_id, name, description, duration_minutes, requirements } = req.body;

      // Validate required fields
      if (!department_id || !name || !duration_minutes) {
        res.status(400).json({
          success: false,
          message: 'Department ID, service name, and duration are required'
        });
        return;
      }

      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Service name is required'
        });
        return;
      }

      const durationNum = parseInt(duration_minutes, 10);
      if (isNaN(durationNum) || durationNum <= 0) {
        res.status(400).json({
          success: false,
          message: 'Duration must be a positive number in minutes'
        });
        return;
      }

      // Verify department exists
      const department = await this.departmentRepository.findById(department_id);
      if (!department) {
        res.status(404).json({
          success: false,
          message: 'Department not found'
        });
        return;
      }

      // Check if service name already exists in this department
      const existingService = await this.serviceRepository.isNameTakenInDepartment(name.trim(), department_id);
      if (existingService) {
        res.status(409).json({
          success: false,
          message: 'Service with this name already exists in the department'
        });
        return;
      }

      const serviceData: CreateServiceData = {
        department_id,
        name: name.trim(),
        description: description?.trim() || null,
        duration_minutes: durationNum,
        requirements: requirements?.trim() || null
      };

      const newService = await this.serviceRepository.create(serviceData);

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: {
          service: newService
        }
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /api/services/:id - Officer/Admin only
  updateService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const serviceId = parseInt(id, 10);

      if (isNaN(serviceId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid service ID'
        });
        return;
      }

      const { department_id, name, description, duration_minutes, requirements } = req.body;

      // Check if service exists
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        res.status(404).json({
          success: false,
          message: 'Service not found'
        });
        return;
      }

      // Validate department if provided
      if (department_id !== undefined) {
        const department = await this.departmentRepository.findById(department_id);
        if (!department) {
          res.status(404).json({
            success: false,
            message: 'Department not found'
          });
          return;
        }
      }

      // Validate name if provided
      if (name !== undefined) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          res.status(400).json({
            success: false,
            message: 'Service name cannot be empty'
          });
          return;
        }

        // Check if new name conflicts with existing service in the same department
        const targetDepartmentId = department_id !== undefined ? department_id : existingService.department_id;
        const nameConflict = await this.serviceRepository.isNameTakenInDepartment(name.trim(), targetDepartmentId, serviceId);
        if (nameConflict) {
          res.status(409).json({
            success: false,
            message: 'Service with this name already exists in the department'
          });
          return;
        }
      }

      // Validate duration if provided
      if (duration_minutes !== undefined) {
        const durationNum = parseInt(duration_minutes, 10);
        if (isNaN(durationNum) || durationNum <= 0) {
          res.status(400).json({
            success: false,
            message: 'Duration must be a positive number in minutes'
          });
          return;
        }
      }

      const updateData: any = {};
      if (department_id !== undefined) updateData.department_id = department_id;
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description?.trim() || null;
      if (duration_minutes !== undefined) updateData.duration_minutes = parseInt(duration_minutes, 10);
      if (requirements !== undefined) updateData.requirements = requirements?.trim() || null;

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
        return;
      }

      const updatedService = await this.serviceRepository.update(serviceId, updateData);

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: {
          service: updatedService
        }
      });
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // DELETE /api/services/:id - Officer/Admin only
  deleteService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const serviceId = parseInt(id, 10);

      if (isNaN(serviceId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid service ID'
        });
        return;
      }

      // Check if service exists
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        res.status(404).json({
          success: false,
          message: 'Service not found'
        });
        return;
      }

      // Check if service has associated timeslots
      const hasTimeslots = await this.serviceRepository.hasAssociatedTimeslots(serviceId);
      if (hasTimeslots) {
        res.status(409).json({
          success: false,
          message: 'Cannot delete service with associated timeslots. Please remove all timeslots first.'
        });
        return;
      }

      // Check if service has associated appointments
      const hasAppointments = await this.serviceRepository.hasAssociatedAppointments(serviceId);
      if (hasAppointments) {
        res.status(409).json({
          success: false,
          message: 'Cannot delete service with associated appointments. This service has appointment history.'
        });
        return;
      }

      await this.serviceRepository.delete(serviceId);

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/services/search - Public endpoint for searching services
  searchServices = async (req: Request, res: Response): Promise<void> => {
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

      const services = await this.serviceRepository.search(query, departmentId);

      res.json({
        success: true,
        data: {
          services,
          search_query: query,
          department_id: departmentId
        }
      });
    } catch (error) {
      console.error('Error searching services:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
