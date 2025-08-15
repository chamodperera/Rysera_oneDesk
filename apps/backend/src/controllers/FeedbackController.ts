import { Request, Response } from 'express';
import { FeedbackRepository } from '../models/FeedbackRepository.js';
import { AppointmentRepository } from '../models/AppointmentRepository.js';
import { AuthenticatedRequest } from '../middlewares/index.js';
import { CreateFeedbackData } from '../types/Feedback.js';

export class FeedbackController {
  private feedbackRepository: FeedbackRepository;
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.feedbackRepository = new FeedbackRepository();
    this.appointmentRepository = new AppointmentRepository();
  }

  // GET /api/feedbacks - Get all feedbacks (Admin/Officer only)
  getAllFeedbacks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const serviceId = req.query.service_id ? parseInt(req.query.service_id as string) : undefined;
      const departmentId = req.query.department_id ? parseInt(req.query.department_id as string) : undefined;
      const minRating = req.query.min_rating ? parseInt(req.query.min_rating as string) : undefined;
      const maxRating = req.query.max_rating ? parseInt(req.query.max_rating as string) : undefined;

      const { feedbacks, total } = await this.feedbackRepository.findAllWithDetails({
        limit,
        offset,
        serviceId,
        departmentId,
        minRating,
        maxRating
      });

      res.json({
        success: true,
        data: {
          feedbacks,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/feedbacks/:id - Get feedback by ID (Admin/Officer only)
  getFeedbackById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const feedbackId = parseInt(id, 10);

      if (isNaN(feedbackId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid feedback ID'
        });
        return;
      }

      const feedback = await this.feedbackRepository.findWithDetails(feedbackId);
      if (!feedback) {
        res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { feedback }
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/feedbacks - Submit feedback (Citizens only, for their own completed appointments)
  submitFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { appointment_id, rating, comment } = req.body;
      const userId = parseInt(req.user?.id as string);

      // Validate required fields
      if (!appointment_id || !rating) {
        res.status(400).json({
          success: false,
          message: 'Appointment ID and rating are required'
        });
        return;
      }

      const appointmentIdNum = parseInt(appointment_id, 10);
      const ratingNum = parseInt(rating, 10);

      if (isNaN(appointmentIdNum) || isNaN(ratingNum)) {
        res.status(400).json({
          success: false,
          message: 'Appointment ID and rating must be valid numbers'
        });
        return;
      }

      // Validate rating range
      if (ratingNum < 1 || ratingNum > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
        return;
      }

      // Verify appointment exists and belongs to the user
      const appointment = await this.appointmentRepository.findById(appointmentIdNum);
      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      // Check if appointment belongs to the user (citizens can only submit feedback for their own appointments)
      if (req.user?.role === 'citizen' && appointment.user_id !== userId) {
        res.status(403).json({
          success: false,
          message: 'You can only submit feedback for your own appointments'
        });
        return;
      }

      // Check if appointment is completed
      if (appointment.status !== 'completed') {
        res.status(400).json({
          success: false,
          message: 'Feedback can only be submitted for completed appointments'
        });
        return;
      }

      // Check if feedback already exists for this appointment
      const existingFeedback = await this.feedbackRepository.checkFeedbackExists(appointmentIdNum, appointment.user_id);
      if (existingFeedback) {
        res.status(409).json({
          success: false,
          message: 'Feedback has already been submitted for this appointment'
        });
        return;
      }

      // Create feedback
      const feedbackData: CreateFeedbackData = {
        appointment_id: appointmentIdNum,
        user_id: appointment.user_id,
        rating: ratingNum,
        comment: comment?.trim() || undefined
      };

      const feedback = await this.feedbackRepository.create(feedbackData);

      // Get feedback with details
      const feedbackWithDetails = await this.feedbackRepository.findWithDetails(feedback.id);

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: { feedback: feedbackWithDetails }
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/feedbacks/my - Get user's own feedbacks (Citizens only)
  getMyFeedbacks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.user?.id as string);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const feedbacks = await this.feedbackRepository.findByUser(userId, {
        limit,
        offset
      });

      // Get total count for pagination
      const allUserFeedbacks = await this.feedbackRepository.findByUser(userId);
      const total = allUserFeedbacks.length;

      res.json({
        success: true,
        data: {
          feedbacks,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user feedbacks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/feedbacks/stats/services - Get aggregated rating statistics per service (Public)
  getServiceRatingStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const serviceId = req.query.service_id ? parseInt(req.query.service_id as string) : undefined;

      if (req.query.service_id && isNaN(serviceId as number)) {
        res.status(400).json({
          success: false,
          message: 'Service ID must be a valid number'
        });
        return;
      }

      const stats = await this.feedbackRepository.getServiceRatingStats(serviceId);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Error fetching service rating stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // DELETE /api/feedbacks/:id - Delete feedback (Admin only)
  deleteFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const feedbackId = parseInt(id, 10);

      if (isNaN(feedbackId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid feedback ID'
        });
        return;
      }

      // Check if feedback exists
      const existingFeedback = await this.feedbackRepository.findById(feedbackId);
      if (!existingFeedback) {
        res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
        return;
      }

      // Delete feedback
      await this.feedbackRepository.delete(feedbackId);

      res.json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}
