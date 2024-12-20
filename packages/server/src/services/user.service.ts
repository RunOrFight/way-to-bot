import { dbInstance } from "../database/init";
import { User } from "../database/entities/user.entity";
import { File } from "../database/entities/file.entity";
import {
  IUserCreatePayload,
  IUserDeletePayload,
  IUserUpdatePayload,
} from "../interfaces/user.interface";
import { DeepPartial } from "typeorm";

export class UserService {
  private userRepository = dbInstance.getRepository(User);

  getUserById = async (userId: number) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        photo: true,
        events: true,
      },
    });

    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    return user;
  };

  getUserByUserName = async (username: string) => {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: {
        photo: true,
        events: true,
      },
    });

    if (!user) {
      throw new Error(`User with username ${username} not found`);
    }

    return user;
  };

  getAllUsers = async () => {
    return this.userRepository.find({
      relations: {
        photo: true,
      },
    });
  };

  createUser = async (user: IUserCreatePayload) => {
    const fileRepository = dbInstance.getRepository(File);
    const newUser = this.userRepository.create(user as DeepPartial<User>);
    if (user.fileId) {
      const photo = await fileRepository.findOneBy({ id: user.fileId });
      if (!photo) {
        throw new Error(`File with id ${user.fileId} not found`);
      }
      newUser.photo = photo;
    }

    return this.userRepository.save(newUser);
  };

  updateUser = async (user: IUserUpdatePayload) => {
    const fileRepository = dbInstance.getRepository(File);

    const existingUser = await this.userRepository.findOneBy({ id: user.id });

    if (!existingUser) {
      throw new Error(`User with id ${user.id} not found`);
    }

    if (user.fileId) {
      const photo = await fileRepository.findOneBy({ id: user.fileId });
      if (!photo) {
        throw new Error(`File with id ${user.fileId} not found`);
      }
      existingUser.photo = photo;
    } else if (user.fileId === null) {
      existingUser.photo = null;
    }

    const updatedUser = this.userRepository.merge(
      existingUser,
      user as DeepPartial<User>,
    );

    return this.userRepository.save(updatedUser);
  };

  deleteUser = async (payload: IUserDeletePayload) => {
    const { userId } = payload;
    const existingUser = await this.userRepository.findOneBy({ id: userId });

    if (!existingUser) {
      throw new Error(`User with id ${userId} not found`);
    }

    const userDeleted = await this.userRepository.delete(userId);

    return userDeleted.affected === 1;
  };
}
