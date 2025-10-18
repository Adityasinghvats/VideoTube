import { Router } from "express";
import { search } from "../controllers/search.controller.js";

const router = Router();

router.get("/s", search);

export default router;