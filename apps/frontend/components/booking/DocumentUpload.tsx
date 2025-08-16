"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DocumentFile {
  file: File;
  type: string;
  comments?: string;
  id: string; // Temporary ID for UI
}

interface DocumentUploadProps {
  documents: DocumentFile[];
  onDocumentsChange: (documents: DocumentFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

const documentTypes = [
  { value: "id_card", label: "ID Card/Passport" },
  { value: "application_form", label: "Application Form" },
  { value: "supporting_docs", label: "Supporting Documents" },
  { value: "proof_of_residence", label: "Proof of Residence" },
  { value: "financial_statement", label: "Financial Statement" },
  { value: "other", label: "Other" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export function DocumentUpload({
  documents,
  onDocumentsChange,
  maxFiles = 5,
  acceptedTypes = ACCEPTED_FILE_TYPES,
  className,
}: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return "File type not supported. Please upload PDF, JPG, or PNG files.";
      }
      if (file.size > MAX_FILE_SIZE) {
        return "File size must be less than 5MB.";
      }
      return null;
    },
    [acceptedTypes]
  );

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      if (documents.length + fileArray.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files.`);
        return;
      }

      const validFiles: DocumentFile[] = [];
      let hasErrors = false;

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          hasErrors = true;
          break;
        }

        validFiles.push({
          file,
          type: "other", // Default type, user can change
          id: generateId(),
        });
      }

      if (!hasErrors) {
        onDocumentsChange([...documents, ...validFiles]);
      }
    },
    [documents, maxFiles, onDocumentsChange, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const updateDocumentType = (id: string, type: string) => {
    onDocumentsChange(
      documents.map((doc) => (doc.id === id ? { ...doc, type } : doc))
    );
  };

  const updateDocumentComments = (id: string, comments: string) => {
    onDocumentsChange(
      documents.map((doc) => (doc.id === id ? { ...doc, comments } : doc))
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
              documents.length >= maxFiles && "opacity-50 pointer-events-none"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: PDF, JPG, PNG (max 5MB each)
            </p>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={documents.length >= maxFiles}
            />
            <Button
              asChild
              variant="outline"
              disabled={documents.length >= maxFiles}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              {documents.length} / {maxFiles} files uploaded
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 bg-gray-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{doc.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`type-${doc.id}`} className="text-xs">
                      Document Type
                    </Label>
                    <Select
                      value={doc.type}
                      onValueChange={(value) =>
                        updateDocumentType(doc.id, value)
                      }
                    >
                      <SelectTrigger id={`type-${doc.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`comments-${doc.id}`} className="text-xs">
                      Comments (Optional)
                    </Label>
                    <Textarea
                      id={`comments-${doc.id}`}
                      placeholder="Any additional notes..."
                      value={doc.comments || ""}
                      onChange={(e) =>
                        updateDocumentComments(doc.id, e.target.value)
                      }
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No documents uploaded yet</p>
          <p className="text-sm">
            Documents are optional but recommended for faster processing
          </p>
        </div>
      )}
    </div>
  );
}
