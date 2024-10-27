import { Request, Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
  IUserCreatePayload,
  IUserDeletePayload,
  IUserUpdatePayload,
} from "packages/shared/src/interfaces/user.interface";

export const UserRouter = Router();
const userController = new UserController();

UserRouter.get("/all", async (req, res) => {
  const data = await userController.getAllUsers();
  res.status(200).json({ data });
});

UserRouter.get("/getById/:id", async (req: Request<{ id: number }>, res) => {
  if (!req.params?.id) {
    throw new Error("Param id is not found");
  }
  const data = await userController.getUserById(req.params.id);
  res.status(200).json({ data });
});

UserRouter.post(
  "/create",
  async (req: Request<{}, {}, IUserCreatePayload>, res) => {
    const data = await userController.createUser(req.body);
    res.status(200).json({ data });
  },
);

UserRouter.put(
  "/update",
  async (req: Request<{}, {}, IUserUpdatePayload>, res) => {
    const data = await userController.updateUser(req.body);
    res.status(200).json({ data });
  },
);

UserRouter.delete(
  "/delete",
  async (req: Request<{}, {}, IUserDeletePayload>, res) => {
    const data = await userController.deleteUser(req.body);
    res.status(200).json({ data });
  },
);