import express from "express";

import {createDeployment, getDeploymentStatusById, getAllDeployments} from "../controllers/deployment.controller.js"

const router = express.Router();

router.post("/deploy", createDeployment);
router.get("/status/:id", getDeploymentStatusById);
router.get("/deployments", getAllDeployments);

export default router;