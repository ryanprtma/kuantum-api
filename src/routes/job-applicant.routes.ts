import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { requireUser } from "../middleware/require-user.js";
import * as controller from "../modules/job-applicant/job-applicant.controller.js";

const r = Router();

r.post("/api/applications", requireUser, asyncHandler(controller.create));
r.get("/api/applications/me", requireUser, asyncHandler(controller.listMine));
r.get(
  "/api/applications/:applicationId/active-session",
  requireUser,
  asyncHandler(controller.getMineActiveSession),
);
r.get(
  "/api/applications/:applicationId",
  requireUser,
  asyncHandler(controller.getMineDetail),
);
r.get(
  "/api/applications/:applicationId/recommend-jobs",
  requireUser,
  asyncHandler(controller.getMineRecommendJobs),
);

export default r;
