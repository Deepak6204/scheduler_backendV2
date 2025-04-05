import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/SwaggerConfig.js';
import authrouter from './api/auth/AuthRoutes.js'
import availabilityRouter from './api/availability/AvailabilityRoutes.js'
import eventRouter from './api/events/EventRoutes.js'
import slotRoutes from './api/misc/SlotRoutes.js'

const app = express();
app.use(express.json());


const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', authrouter)
app.use('/api/availabilities', availabilityRouter)
app.use('/api/events', eventRouter)
app.use('/api/slots', slotRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Docs available at  http://localhost:${PORT}/api-docs`);
});
