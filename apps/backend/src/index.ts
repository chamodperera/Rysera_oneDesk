import { createServer } from "./server";
import config from "./config";

const server = createServer();
const port = config.port;

server.listen(port, () => {
  console.log(`🚀 Government Appointment Booking System API running on port ${port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌏 Timezone: ${config.timezone}`);
  console.log(`📋 API Documentation: http://localhost:${port}/api-docs (to be implemented)`);
});
