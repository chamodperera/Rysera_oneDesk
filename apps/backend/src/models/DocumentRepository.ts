import { BaseRepository } from './BaseRepository.js';
import { supabaseAdmin } from '../config/supabase.js';

export interface Document {
  id: number;
  appointment_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  document_type: string | null;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
}

export interface CreateDocumentData {
  appointment_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  document_type?: string;
  status?: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

export interface UpdateDocumentData {
  document_type?: string;
  status?: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

export interface DocumentWithAppointment extends Document {
  appointment?: {
    id: number;
    booking_no: number;
    booking_reference: string;
    status: string;
    service?: {
      name: string;
      department?: {
        name: string;
      };
    };
    user?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export class DocumentRepository extends BaseRepository<Document, CreateDocumentData, UpdateDocumentData> {
  protected tableName = 'documents';

  /**
   * Create a new document record
   */
  async create(data: CreateDocumentData): Promise<Document> {
    const { data: document, error } = await supabaseAdmin
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }

    return document;
  }

  /**
   * Get document by ID
   */
  async findById(id: number): Promise<Document | null> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find document: ${error.message}`);
    }

    return data;
  }

  /**
   * Get documents by appointment ID (for officers to check appointment documents)
   */
  async findByAppointmentId(appointmentId: number): Promise<DocumentWithAppointment[]> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select(`
        *,
        appointment:appointments!documents_appointment_id_fkey (
          id,
          booking_no,
          booking_reference,
          status,
          service:services!appointments_service_id_fkey (
            name,
            department:departments!services_department_id_fkey (
              name
            )
          ),
          user:users!appointments_user_id_fkey (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('appointment_id', appointmentId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find documents for appointment: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get documents by user ID (for citizens to see their own documents)
   */
  async findByUserId(userId: number): Promise<DocumentWithAppointment[]> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select(`
        *,
        appointment:appointments!documents_appointment_id_fkey (
          id,
          booking_no,
          booking_reference,
          status,
          service:services!appointments_service_id_fkey (
            name,
            department:departments!services_department_id_fkey (
              name
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find documents for user: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get documents for officer's department appointments
   */
  async findByOfficerDepartment(officerId: number): Promise<DocumentWithAppointment[]> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select(`
        *,
        appointment:appointments!documents_appointment_id_fkey (
          id,
          booking_no,
          booking_reference,
          status,
          officer_id,
          service:services!appointments_service_id_fkey (
            name,
            department:departments!services_department_id_fkey (
              name
            )
          ),
          user:users!appointments_user_id_fkey (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('appointment.officer_id', officerId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find documents for officer: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update document status/comments (for officers)
   */
  async update(id: number, data: UpdateDocumentData): Promise<Document> {
    const { data: document, error } = await supabaseAdmin
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return document;
  }

  /**
   * Delete document
   */
  async delete(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    return true;
  }

  /**
   * Check if user owns the document
   */
  async isOwner(documentId: number, userId: number): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('user_id')
      .eq('id', documentId)
      .single();

    if (error || !data) return false;
    return data.user_id === userId;
  }

  /**
   * Check if officer can access document (same department)
   */
  async canOfficerAccess(documentId: number, officerId: number): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select(`
        appointment:appointments!documents_appointment_id_fkey (
          service:services!appointments_service_id_fkey (
            department_id
          )
        )
      `)
      .eq('id', documentId)
      .single();

    if (error || !data) return false;

    // Get officer's department
    const { data: officer, error: officerError } = await supabaseAdmin
      .from('officers')
      .select('department_id')
      .eq('id', officerId)
      .single();

    if (officerError || !officer) return false;

    // Fix the type casting issue
    const appointment = data.appointment as any;
    return appointment?.service?.department_id === officer.department_id;
  }
}
