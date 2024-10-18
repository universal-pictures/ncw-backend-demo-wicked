import { Device } from "../model/device";
import { User } from "../model/user";
import { Wallet } from "../model/wallet";
import { Clients } from "../interfaces/Clients";
import { FindOptionsOrderValue } from "typeorm";

export class UpdateDatabaseService {
  constructor(private readonly clients: Clients) {}

  async findOne(deviceId: string) {
    return await Device.findOne({
      where: { id: deviceId },
      relations: { user: true },
    });
  }

  async findAll(
    sub: string,
    walletId?: string,
    dir: FindOptionsOrderValue = "ASC",
  ) {
    return await Device.find({
      where: { walletId, user: { sub } },
      relations: { user: true },
      order: {
        createdAt: dir,
      },
    });
  }

  async assignNewUser(deviceId: string, walletId: string, sub: string) {
    let user: User | null;

    user = await User.findOneBy({ sub });
    if (!user) {
      user = new User();
      user.sub = sub!;
      await user.save();
    }

    const wallet = new Wallet();
    wallet.id = walletId;

    const device = new Device();
    device.id = deviceId;
    device.wallet = wallet;
    device.user = user;

    await device.save();

    return { walletId };
  }
}
