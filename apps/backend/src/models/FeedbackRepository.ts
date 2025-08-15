import { BaseRepository } from './BaseRepository.js';
import { 
  Feedback, 
  CreateFeedbackData, 
  FeedbackWithDetails, 
  ServiceRatingStats 
} from '../types/Feedback.js';

export class FeedbackRepository extends BaseRepository<Feedback, CreateFeedbackData, Partial<CreateFeedbackData>> {
  constructor() {
    super('feedbacks');
  }

  async findWithDetails(id: number): Promise<FeedbackWithDetails | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        appointment:appointments!inner (
          id,
          booking_reference,
          booking_no,
          service:services!inner (
            id,
            name,
            department:departments!inner (
              id,
              name
            )
          ),
          timeslot:timeslots!inner (
            slot_date,
            start_time,
            end_time
          )
        ),
        user:users!inner (
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findByAppointment(appointmentId: number): Promise<Feedback | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async findByUser(userId: number, options?: {
    limit?: number;
    offset?: number;
  }): Promise<FeedbackWithDetails[]> {
    let query = this.client
      .from(this.tableName)
      .select(`
        *,
        appointment:appointments!inner (
          id,
          booking_reference,
          booking_no,
          service:services!inner (
            id,
            name,
            department:departments!inner (
              id,
              name
            )
          ),
          timeslot:timeslots!inner (
            slot_date,
            start_time,
            end_time
          )
        ),
        user:users!inner (
          id,
          first_name,
          last_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async findAllWithDetails(options?: {
    limit?: number;
    offset?: number;
    serviceId?: number;
    departmentId?: number;
    minRating?: number;
    maxRating?: number;
  }): Promise<{ feedbacks: FeedbackWithDetails[]; total: number }> {
    // Build the query
    let query = this.client
      .from(this.tableName)
      .select(`
        *,
        appointment:appointments!inner (
          id,
          booking_reference,
          booking_no,
          service:services!inner (
            id,
            name,
            department:departments!inner (
              id,
              name
            )
          ),
          timeslot:timeslots!inner (
            slot_date,
            start_time,
            end_time
          )
        ),
        user:users!inner (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.serviceId) {
      query = query.eq('appointment.service.id', options.serviceId);
    }

    if (options?.departmentId) {
      query = query.eq('appointment.service.department.id', options.departmentId);
    }

    if (options?.minRating) {
      query = query.gte('rating', options.minRating);
    }

    if (options?.maxRating) {
      query = query.lte('rating', options.maxRating);
    }

    // Get total count
    const countQuery = this.client
      .from(this.tableName)
      .select('id', { count: 'exact', head: true });

    // Apply same filters for count
    if (options?.serviceId) {
      countQuery.eq('appointment.service.id', options.serviceId);
    }
    if (options?.departmentId) {
      countQuery.eq('appointment.service.department.id', options.departmentId);
    }
    if (options?.minRating) {
      countQuery.gte('rating', options.minRating);
    }
    if (options?.maxRating) {
      countQuery.lte('rating', options.maxRating);
    }

    const { count } = await countQuery;

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      feedbacks: data || [],
      total: count || 0
    };
  }

  async getServiceRatingStats(serviceId?: number): Promise<ServiceRatingStats[]> {
    // Since we can't use complex SQL RPC, we'll aggregate the data manually
    const { data: services, error: servicesError } = await this.client
      .from('services')
      .select(`
        id,
        name,
        department:departments!inner (
          id,
          name
        )
      `)
      .eq(serviceId ? 'id' : 'id', serviceId || 'id');

    if (servicesError) throw servicesError;

    const stats: ServiceRatingStats[] = [];

    for (const service of services || []) {
      // Get all feedbacks for this service
      const { data: feedbacks, error: feedbacksError } = await this.client
        .from(this.tableName)
        .select(`
          rating,
          appointment:appointments!inner (
            service_id
          )
        `)
        .eq('appointment.service_id', service.id);

      if (feedbacksError) throw feedbacksError;

      if (feedbacks && feedbacks.length > 0) {
        const totalFeedbacks = feedbacks.length;
        const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks;
        
        const ratingDistribution = {
          rating_1: feedbacks.filter(f => f.rating === 1).length,
          rating_2: feedbacks.filter(f => f.rating === 2).length,
          rating_3: feedbacks.filter(f => f.rating === 3).length,
          rating_4: feedbacks.filter(f => f.rating === 4).length,
          rating_5: feedbacks.filter(f => f.rating === 5).length,
        };

        stats.push({
          service_id: service.id,
          service_name: service.name,
          department_name: (service.department as any).name,
          total_feedbacks: totalFeedbacks,
          average_rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
          rating_distribution: ratingDistribution
        });
      }
    }

    // Sort by average rating desc, then by total feedbacks desc
    return stats.sort((a, b) => {
      if (b.average_rating !== a.average_rating) {
        return b.average_rating - a.average_rating;
      }
      return b.total_feedbacks - a.total_feedbacks;
    });
  }

  async checkFeedbackExists(appointmentId: number, userId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  }
}
