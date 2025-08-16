"use client";

import { useState, useEffect, useCallback } from "react";
import { documentApi, type Document } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload, type DocumentFile } from "../booking/DocumentUpload";
import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppointmentDocumentsProps {
  appointmentId: number;
  canUpload?: boolean;
}

export function AppointmentDocuments({
  appointmentId,
  canUpload = true,
}: AppointmentDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadDocuments, setUploadDocuments] = useState<DocumentFile[]>([]);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await documentApi.getAppointmentDocuments(appointmentId);
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        console.error("Failed to fetch documents:", response.error);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchDocuments();
  }, [appointmentId, fetchDocuments]);

  const handleDocumentUpload = async () => {
    if (uploadDocuments.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = uploadDocuments.map(async (doc) => {
        return documentApi.uploadDocument(
          appointmentId,
          doc.file,
          doc.type,
          doc.comments
        );
      });

      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter((result) => !result.success);

      if (failedUploads.length > 0) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${failedUploads.length} document(s)`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${uploadDocuments.length} document(s)`,
        });
        setUploadDocuments([]);
        setShowUpload(false);
        await fetchDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await documentApi.downloadDocument(doc.id);
      if (response.success && response.data) {
        // Open the download URL in a new tab
        window.open(response.data.download_url, "_blank");
      } else {
        toast({
          title: "Download Failed",
          description: "Could not generate download link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the document",
        variant: "destructive",
      });
    }
  };

  const formatFileType = (type: string) => {
    const typeMap: Record<string, string> = {
      id_card: "ID Card/Passport",
      application_form: "Application Form",
      supporting_docs: "Supporting Documents",
      proof_of_residence: "Proof of Residence",
      financial_statement: "Financial Statement",
      other: "Other",
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDocuments}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {canUpload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Documents
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && documents.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileType(doc.document_type)}
                    </p>
                    {doc.comments && (
                      <p className="text-xs text-gray-600 mt-1">
                        {doc.comments}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No documents uploaded</p>
            {canUpload && (
              <p className="text-sm">
                Click &quot;Add Documents&quot; to upload files
              </p>
            )}
          </div>
        )}

        {/* Upload Section */}
        {showUpload && canUpload && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-4">Upload New Documents</h4>
            <DocumentUpload
              documents={uploadDocuments}
              onDocumentsChange={setUploadDocuments}
              maxFiles={5}
            />
            {uploadDocuments.length > 0 && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDocuments([]);
                    setShowUpload(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleDocumentUpload} disabled={loading}>
                  {loading ? "Uploading..." : "Upload Documents"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
