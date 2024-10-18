import { Request, NextFunction, Response } from "express";
import { UpdateDatabaseService } from "../services/updateDatabase.service";

export class UpdateDatabaseController {
  constructor(private readonly service: UpdateDatabaseService) {}

  async assign(req: Request, res: Response, next: NextFunction) {
    const { params, body } = req;
    const { deviceId } = params;
    const { walletId, userId } = body;

    try {
      // check if device was already assigned wallet
      const prevDevice = await this.service.findOne(deviceId);
      if (prevDevice) {
        if (prevDevice.user.sub !== userId && prevDevice.user.sub !== null) { // Existing user id assigned
          return res.status(401).send();
        }
      }

      await this.service.assignNewUser(deviceId, walletId, userId);
      res.json({ walletId });
    } catch (err) {
      next(err);
    }
  }
  async findAll(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.body;
    try {
      const devices = await this.service.findAll(userId!);
      res.json({
        devices: devices.map(({ id, walletId, createdAt }) => ({
          deviceId: id,
          walletId,
          createdAt: createdAt.valueOf(),
        })),
      });
    } catch (err) {
      next(err);
    }
  }
}
