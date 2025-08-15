export interface Feedback {
  id: number;
  appointment_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface CreateFeedbackData {
  appointment_id: number;
  user_id: number;
  rating: number;
  comment?: string;
}

export interface FeedbackWithDetails extends Feedback {
  appointment: {
    id: number;
    booking_reference: string;
    booking_no: number;
    service: {
      id: number;
      name: string;
      department: {
        id: number;
        name: string;
      };
    };
    timeslot: {
      slot_date: string;
      start_time: string;
      end_time: string;
    };
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface ServiceRatingStats {
  service_id: number;
  service_name: string;
  department_name: string;
  total_feedbacks: number;
  average_rating: number;
  rating_distribution: {
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
  };
}
