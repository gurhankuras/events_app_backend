import mongoose from "mongoose";
import { User, UserDoc } from "../../models/user";

export class UserRepository {
    async findById(id: string): Promise<UserDoc | null> {
        return User.findById(id)
    }

    async create({id, name}: {id: string, name: string}) {
        const user = User.build({_id: new mongoose.Types.ObjectId(id), name: name})
        const savedUser = await user.save()
        return savedUser
    }
}

export const userRepository = new UserRepository()