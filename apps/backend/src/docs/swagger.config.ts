import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { swaggerDocument } from './swagger-document';

/**
 * Setup Complete Swagger Documentation
 * 
 * This function configures Swagger UI with the complete API documentation
 * imported from the separate swagger-document.ts file.
 */
export const setupCompleteSwagger = (app: Express): void => {
  // Swagger UI options
  const options = {
    explorer: true,
    customCss: `
      .topbar-wrapper .link {
        content: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFo2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+');
        width: 200px;
        height: auto;
      }
      .swagger-ui .topbar { background-color: #1e40af; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .info .title { color: #1e40af; }
    `,
    customSiteTitle: 'Government Appointment Booking API - Complete Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      requestInterceptor: (req: any) => {
        // Add any request interceptors here
        return req;
      }
    }
  };

  // Setup Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
  
  // JSON endpoint for the raw swagger document
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  console.log('📚 Complete Swagger documentation available at: /api-docs');
  console.log('📄 Raw JSON available at: /api-docs.json');
  console.log('📋 Documented endpoints:');
  console.log('   🔐 Authentication: 8 endpoints');
  console.log('   👥 User Management: 6 endpoints');
  console.log('   🏛️  Departments: 5 endpoints');
  console.log('   🛠️  Services: 7 endpoints');
  console.log('   👮 Officers: 7 endpoints');
  console.log('   ⏰ Timeslots: 11 endpoints');
  console.log('   📅 Appointments: 10 endpoints');
  console.log('   💬 Feedback: 3 endpoints');
  console.log('   ❤️  Health: 1 endpoint');
  console.log('   🎯 Total: 58 endpoints fully documented');
};

export default setupCompleteSwagger;
