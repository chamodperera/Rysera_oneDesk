import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { documentRepository } from '../models/index.js';
import { AuthenticatedRequest } from '../middlewares/index.js';

export class DocumentController {
  /**
   * Upload document linked to an appointment (Citizens only for their appointments)
   */
  static async uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const { appointment_id, document_type, comments } = req.body;
      const userId = parseInt(req.user!.id);
      
      if (!appointment_id) {
        res.status(400).json({
          success: false,
          error: 'appointment_id is required'
        });
        return;
      }

      // Verify user owns the appointment (Citizens can only upload for their appointments)
      if (req.user!.role === 'citizen') {
        const { data: appointment, error: appointmentError } = await supabaseAdmin
          .from('appointments')
          .select('user_id')
          .eq('id', appointment_id)
          .single();

        if (appointmentError || !appointment || appointment.user_id !== userId) {
          res.status(403).json({
            success: false,
            error: 'You can only upload documents for your own appointments'
          });
          return;
        }
      }

      const file = req.file;
      const fileName = `appointment-${appointment_id}-${Date.now()}-${file.originalname}`;
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

      // Upload to Supabase Storage using admin client (no RLS)
      const { data: storageData, error: storageError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          duplex: 'half'
        });

      if (storageError) {
        console.error('Supabase upload error:', storageError);
        res.status(500).json({
          success: false,
          error: 'Failed to upload file to storage',
          details: storageError.message
        });
        return;
      }

      // Create document record in database
      const document = await documentRepository.create({
        appointment_id: parseInt(appointment_id),
        user_id: userId,
        file_name: file.originalname,
        file_path: storageData.path,
        document_type: document_type || 'general',
        status: 'pending',
        comments: comments || null
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          id: document.id,
          appointment_id: document.appointment_id,
          file_name: document.file_name,
          document_type: document.document_type,
          status: document.status,
          uploaded_at: document.uploaded_at,
          comments: document.comments
          // Note: No direct URL provided - must use download endpoint
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during upload'
      });
    }
  }

  /**
   * Download/view document with backend authentication
   */
  static async downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      if (!documentId) {
        res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
        return;
      }

      const document = await documentRepository.findById(parseInt(documentId));
      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Document not found'
        });
        return;
      }

      // Check access permissions
      let hasAccess = false;

      if (userRole === 'citizen') {
        // Citizens can only access their own documents
        hasAccess = document.user_id === userId;
      } else if (userRole === 'officer') {
        // Officers can access documents for appointments in their department
        const { data: officer, error: officerError } = await supabaseAdmin
          .from('officers')
          .select('department_id')
          .eq('user_id', userId)
          .single();

        if (!officerError && officer) {
          const { data: appointment, error: appointmentError } = await supabaseAdmin
            .from('appointments')
            .select(`
              service:services!appointments_service_id_fkey (
                department_id
              )
            `)
            .eq('id', document.appointment_id)
            .single();

          if (!appointmentError && appointment) {
            const service = appointment.service as any;
            hasAccess = service?.department_id === officer.department_id;
          }
        }
      } else if (userRole === 'admin') {
        // Admins can access all documents
        hasAccess = true;
      }

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to access this document'
        });
        return;
      }

      // Generate signed URL for secure access (expires in 1 hour)
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
      const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError);
        res.status(500).json({
          success: false,
          error: 'Failed to generate download URL'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          document_id: document.id,
          file_name: document.file_name,
          document_type: document.document_type,
          download_url: signedUrlData.signedUrl,
          expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        }
      });

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get documents for an appointment (Officers can check documents for appointments in their department)
   */
  static async getAppointmentDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      if (!appointmentId) {
        res.status(400).json({
          success: false,
          error: 'Appointment ID is required'
        });
        return;
      }

      // Check access permissions
      if (userRole === 'citizen') {
        // Citizens can only see documents for their own appointments
        const { data: appointment, error: appointmentError } = await supabaseAdmin
          .from('appointments')
          .select('user_id')
          .eq('id', appointmentId)
          .single();

        if (appointmentError || !appointment || appointment.user_id !== userId) {
          res.status(403).json({
            success: false,
            error: 'You can only view documents for your own appointments'
          });
          return;
        }
      } else if (userRole === 'officer') {
        // Officers can see documents for appointments in their department
        const { data: officer, error: officerError } = await supabaseAdmin
          .from('officers')
          .select('department_id')
          .eq('user_id', userId)
          .single();

        if (officerError || !officer) {
          res.status(403).json({
            success: false,
            error: 'Officer profile not found'
          });
          return;
        }

        const { data: appointment, error: appointmentError } = await supabaseAdmin
          .from('appointments')
          .select(`
            service:services!appointments_service_id_fkey (
              department_id
            )
          `)
          .eq('id', appointmentId)
          .single();

        if (appointmentError || !appointment) {
          res.status(404).json({
            success: false,
            error: 'Appointment not found'
          });
          return;
        }

        const service = appointment.service as any;
        if (service?.department_id !== officer.department_id) {
          res.status(403).json({
            success: false,
            error: 'You can only view documents for appointments in your department'
          });
          return;
        }
      }
      // Admin can access all documents

      const documents = await documentRepository.findByAppointmentId(parseInt(appointmentId));

      // Return document metadata only (no direct URLs)
      const documentsResponse = documents.map(doc => ({
        id: doc.id,
        appointment_id: doc.appointment_id,
        file_name: doc.file_name,
        document_type: doc.document_type,
        status: doc.status,
        uploaded_at: doc.uploaded_at,
        comments: doc.comments,
        user: doc.appointment?.user ? {
          first_name: doc.appointment.user.first_name,
          last_name: doc.appointment.user.last_name,
          email: doc.appointment.user.email
        } : null
        // Note: Use /api/documents/download/:documentId to get the actual file
      }));

      res.status(200).json({
        success: true,
        data: documentsResponse,
        message: 'Use /api/documents/download/:documentId to download individual files'
      });

    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user's own documents (Citizens)
   */
  static async getUserDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.user!.id);
      const documents = await documentRepository.findByUserId(userId);

      // Return document metadata only (no direct URLs)
      const documentsResponse = documents.map(doc => ({
        id: doc.id,
        appointment_id: doc.appointment_id,
        file_name: doc.file_name,
        document_type: doc.document_type,
        status: doc.status,
        uploaded_at: doc.uploaded_at,
        comments: doc.comments,
        appointment: doc.appointment ? {
          booking_no: doc.appointment.booking_no,
          booking_reference: doc.appointment.booking_reference,
          status: doc.appointment.status,
          service_name: doc.appointment.service?.name,
          department_name: doc.appointment.service?.department?.name
        } : null
        // Note: Use /api/documents/download/:documentId to get the actual file
      }));

      res.status(200).json({
        success: true,
        data: documentsResponse,
        message: 'Use /api/documents/download/:documentId to download individual files'
      });

    } catch (error) {
      console.error('Get user documents error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update document status/comments (Officers, Admins)
   */
  static async updateDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const { status, comments, document_type } = req.body;
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      if (!documentId) {
        res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
        return;
      }

      // Check access permissions
      if (userRole === 'officer') {
        const { data: officer, error: officerError } = await supabaseAdmin
          .from('officers')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (officerError || !officer) {
          res.status(403).json({
            success: false,
            error: 'Officer profile not found'
          });
          return;
        }

        const canAccess = await documentRepository.canOfficerAccess(parseInt(documentId), officer.id);
        if (!canAccess) {
          res.status(403).json({
            success: false,
            error: 'You can only update documents for appointments in your department'
          });
          return;
        }
      }
      // Admin can update all documents

      const updateData: any = {};
      if (status) updateData.status = status;
      if (comments !== undefined) updateData.comments = comments;
      if (document_type) updateData.document_type = document_type;

      const document = await documentRepository.update(parseInt(documentId), updateData);

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: {
          id: document.id,
          status: document.status,
          comments: document.comments,
          document_type: document.document_type
        }
      });

    } catch (error) {
      console.error('Update document error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete document (Document owner or Admins)
   */
  static async deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      if (!documentId) {
        res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
        return;
      }

      const document = await documentRepository.findById(parseInt(documentId));
      if (!document) {
        res.status(404).json({
          success: false,
          error: 'Document not found'
        });
        return;
      }

      // Check access permissions
      if (userRole === 'citizen' || userRole === 'officer') {
        const isOwner = await documentRepository.isOwner(parseInt(documentId), userId);
        if (!isOwner) {
          res.status(403).json({
            success: false,
            error: 'You can only delete your own documents'
          });
          return;
        }
      }
      // Admin can delete all documents

      // Delete from storage using admin client
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
      const { error: storageError } = await supabaseAdmin.storage
        .from(bucketName)
        .remove([document.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      await documentRepository.delete(parseInt(documentId));

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ========================
  // TEST ENDPOINTS (Legacy)
  // ========================

  /**
   * Test document upload to Supabase Storage
   */
  static async testUpload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const file = req.file;
      const fileName = `test-${Date.now()}-${file.originalname}`;
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

      // Upload to Supabase Storage using admin client
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          duplex: 'half'
        });

      if (error) {
        console.error('Supabase upload error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to upload file to storage',
          details: error.message
        });
        return;
      }

      // Get signed URL for testing
      const { data: urlData } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileName,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          storageKey: data.path,
          signedUrl: urlData?.signedUrl
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during upload'
      });
    }
  }

  /**
   * List all documents in storage bucket (for testing)
   */
  static async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .list();

      if (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to list documents',
          details: error.message
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: data || []
      });

    } catch (error) {
      console.error('List documents error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Delete a document from storage (for testing)
   */
  static async deleteTestDocument(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

      const { error } = await supabaseAdmin.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete document',
          details: error.message
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
