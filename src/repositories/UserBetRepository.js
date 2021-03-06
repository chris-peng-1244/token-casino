// @flow
import UserBet from "../domains/UserBet";
import UserBetView from "../models/UserBetView";
import User from "../domains/User";
import {toWei,fromWei} from '../utils/eth-units';
import Game from "../domains/Game";
import UserBetTable from "../models/UserBetTable";
import InviteReward from "../domains/InviteReward";

class UserBetRepository {
    async getUserBetListByGameId(gameId: string): Promise<UserBet[]> {
        const data = await UserBetView.findAll({
            where: {gameId}
        });
        return data.map(value => {
            return _db2Domain(value);
        });
    }

    async getUserBetByGameId(gameId: number, userId: number): Promise<UserBet | null> {
        const data = await UserBetView.find({
            where: {gameId, userId},
        });
        if (!data) {
            return null;
        }
        return _db2Domain(data);
    }

    async createUserBet(game: Game, userBet: UserBet) {
        const betData = await UserBetTable.find({
            where: {
                gameId: game.id,
                userId: userBet.user.id,
            },
        });

        if (!betData) {
            return await UserBetTable.create({
                gameId: game.id,
                userId: userBet.user.id,
                manualInvest: fromWei(userBet.manualInvest),
                autoInvest: fromWei(userBet.autoInvest),
                reward: fromWei(userBet.reward),
                lastInvestedAt: userBet.lastInvestedAt,
            });
        }

        betData.manualInvest = fromWei(toWei(betData.manualInvest) + userBet.manualInvest);
        betData.autoInvest = fromWei(toWei(betData.autoInvest) + userBet.autoInvest);
        betData.reward = fromWei(toWei(betData.reward) + userBet.reward);
        betData.lastInvestedAt = userBet.lastInvestedAt;
        await betData.save();
    }

    async addInviteReward(game: Game, reward: InviteReward) {
        const betData = await UserBetTable.find({
            where: {
                gameId: game.id,
                userId: reward.inviter.id,
            }
        });
        if (!betData) {
            return await UserBetTable.create({
                gameId: game.id,
                userId: reward.inviter.id,
                manualInvest: 0,
                autoInvest: 0,
                reward: fromWei(reward.value),
                lastInvestedAt: new Date(),
            });
        }
        betData.reward = fromWei(toWei(betData.reward) + reward.value);
        await betData.save();
    }

    async updateUserBet(userBet: UserBet) {
        await UserBetTable.update(
            {
                reward: fromWei(userBet.reward),
                manualInvest: fromWei(userBet.manualInvest),
                autoInvest: fromWei(userBet.autoInvest),
                lastInvestedAt: userBet.lastInvestedAt,
            },
            {where: {id: userBet.id}}
        );
    }

}

function _db2Domain(value: Object): UserBet{
    const bet = new UserBet();
    bet.id = value.id;
    bet.manualInvest = toWei(value.manualInvest, 'ether');
    bet.autoInvest = toWei(value.autoInvest, 'ether');
    bet.reward = toWei(value.reward, 'ether');
    bet.lastInvestedAt = value.lastInvestedAt;
    bet.user = new User(
        value.userId,
        toWei(value.userBalance, 'ether'),
        value.userInviteCode);
    bet.user.inviterId = value.userInviterId;
    return bet;
}

export default UserBetRepository;
