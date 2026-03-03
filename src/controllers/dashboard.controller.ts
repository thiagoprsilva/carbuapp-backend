import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

const dashboardService = new DashboardService();

export class DashboardController {
  async summary(req: Request, res: Response) {
    try {
      const oficinaId = req.user!.oficinaId;
      const result = await dashboardService.summary(oficinaId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}