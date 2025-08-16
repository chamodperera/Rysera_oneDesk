import { Router, IRouter } from 'express';
import { DocumentController } from '../controllers/documentController.js';
import { uploadSingle } from '../middlewares/upload.js';
import { authenticateToken, requireRole } from '../middlewares/index.js';
import { UserRole } from '../types/database.js';

const router: IRouter = Router();

// =========================
// PRODUCTION ENDPOINTS
// =========================

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload document linked to an appointment
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: document
 *         type: file
 *         required: true
 *         description: The document file to upload (PDF, PNG, JPG - max 5MB)
 *       - in: formData
 *         name: appointment_id
 *         type: integer
 *         required: true
 *         description: ID of the appointment this document belongs to
 *       - in: formData
 *         name: document_type
 *         type: string
 *         description: Type of document (e.g., 'id_card', 'application_form', 'supporting_docs')
 *       - in: formData
 *         name: comments
 *         type: string
 *         description: Optional comments about the document
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Bad request - missing file or appointment_id
 *       403:
 *         description: Forbidden - can only upload for own appointments
 *       500:
 *         description: Server error
 */
router.post('/upload', 
  authenticateToken, 
  requireRole(UserRole.CITIZEN, UserRole.ADMIN), 
  uploadSingle, 
  DocumentController.uploadDocument
);

/**
 * @swagger
 * /api/documents/download/{documentId}:
 *   get:
 *     summary: Download/view document with backend authentication
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The document ID
 *     responses:
 *       200:
 *         description: Signed download URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     document_id:
 *                       type: integer
 *                     file_name:
 *                       type: string
 *                     download_url:
 *                       type: string
 *                     expires_at:
 *                       type: string
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get('/download/:documentId', 
  authenticateToken, 
  DocumentController.downloadDocument
);

/**
 * @swagger
 * /api/documents/appointment/{appointmentId}:
 *   get:
 *     summary: Get documents for a specific appointment
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The appointment ID
 *     responses:
 *       200:
 *         description: Documents retrieved successfully (metadata only, use download endpoint for files)
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.get('/appointment/:appointmentId', 
  authenticateToken, 
  DocumentController.getAppointmentDocuments
);

/**
 * @swagger
 * /api/documents/my-documents:
 *   get:
 *     summary: Get user's own documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/my-documents', 
  authenticateToken, 
  DocumentController.getUserDocuments
);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   put:
 *     summary: Update document status/comments (Officers, Admins)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               comments:
 *                 type: string
 *               document_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.put('/:documentId', 
  authenticateToken, 
  requireRole(UserRole.OFFICER, UserRole.ADMIN), 
  DocumentController.updateDocument
);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       403:
 *         description: Forbidden - can only delete own documents
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.delete('/:documentId', 
  authenticateToken, 
  DocumentController.deleteDocument
);

// =========================
// TEST ENDPOINTS (Legacy)
// =========================

/**
 * @swagger
 * /api/documents/test-upload:
 *   post:
 *     summary: Test document upload to Supabase Storage
 *     tags: [Documents - Test]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: document
 *         type: file
 *         required: true
 *         description: The document file to upload (PDF, PNG, JPG - max 5MB)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       500:
 *         description: Server error
 */
router.post('/test-upload', uploadSingle, DocumentController.testUpload);

/**
 * @swagger
 * /api/documents/list:
 *   get:
 *     summary: List all documents in storage bucket
 *     tags: [Documents - Test]
 *     responses:
 *       200:
 *         description: Documents listed successfully
 *       500:
 *         description: Server error
 */
router.get('/list', DocumentController.listDocuments);

/**
 * @swagger
 * /api/documents/test/{fileName}:
 *   delete:
 *     summary: Delete a document from storage (testing)
 *     tags: [Documents - Test]
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to delete
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/test/:fileName', DocumentController.deleteTestDocument);

export default router;
