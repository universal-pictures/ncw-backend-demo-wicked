import { Router } from "express";
import { Clients } from "../interfaces/Clients";
import { UpdateDatabaseController } from "../controllers/updateDatabase.controller";
import { UpdateDatabaseService } from "../services/updateDatabase.service";

export function createUpdateDatabaseRoute(clients: Clients) {
  const route = Router({ mergeParams: true });
  const service = new UpdateDatabaseService(clients);
  const controller = new UpdateDatabaseController(service);

  route.post("/:deviceId", controller.assign.bind(controller));
  route.get("/:deviceId", controller.findAll.bind(controller));
  return route;
}
