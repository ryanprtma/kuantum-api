import { Router } from 'express';
import healthRoutes from './health.routes.js';
import bootstrapRoutes from './bootstrap.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import comparisonRoutes from './comparison.routes.js';
import companyRoutes from './company.routes.js';
import jobRoutes from './job.routes.js';
import sessionRoutes from './session.routes.js';
import agentRoutes from './agent.routes.js';
import candidateRoutes from './candidate.routes.js';

const root = Router();

root.use(healthRoutes);
root.use(bootstrapRoutes);
root.use(authRoutes);
root.use(userRoutes);
root.use(dashboardRoutes);
root.use(comparisonRoutes);
root.use(companyRoutes);
root.use(jobRoutes);
root.use(sessionRoutes);
root.use(agentRoutes);
root.use(candidateRoutes);

export default root;
