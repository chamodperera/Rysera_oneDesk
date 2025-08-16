/**
 * Utility functions for generating OpenAPI documentation
 */

/**
 * Generate a standardized API response schema
 */
export const createApiResponse = (dataSchema: any, description: string = "Successful response") => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "Operation completed successfully"
          },
          data: dataSchema
        },
        required: ["success", "data"]
      }
    }
  }
});

/**
 * Generate a standardized paginated response schema
 */
export const createPaginatedResponse = (itemSchema: any, description: string = "Paginated response") => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          message: {
            type: "string",
            example: "Data retrieved successfully"
          },
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: itemSchema
              },
              pagination: {
                $ref: "#/components/schemas/PaginationInfo"
              }
            }
          }
        },
        required: ["success", "data"]
      }
    }
  }
});

/**
 * Generate standardized error responses
 */
export const errorResponses = {
  400: { $ref: "#/components/responses/ValidationError" },
  401: { $ref: "#/components/responses/UnauthorizedError" },
  403: { $ref: "#/components/responses/ForbiddenError" },
  404: { $ref: "#/components/responses/NotFoundError" },
  500: { $ref: "#/components/responses/InternalServerError" }
};

/**
 * Generate common query parameters for pagination
 */
export const paginationParams = [
  {
    name: "page",
    in: "query",
    description: "Page number",
    required: false,
    schema: {
      type: "integer",
      minimum: 1,
      default: 1
    }
  },
  {
    name: "limit",
    in: "query", 
    description: "Number of items per page",
    required: false,
    schema: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 10
    }
  }
];

/**
 * Generate JWT security requirement
 */
export const jwtSecurity = [{ bearerAuth: [] }];

/**
 * Standard HTTP methods for CRUD operations
 */
export const httpMethods = {
  GET: "get",
  POST: "post", 
  PUT: "put",
  DELETE: "delete",
  PATCH: "patch"
} as const;
