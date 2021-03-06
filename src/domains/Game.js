// @flow
import UserBet from "./UserBet";
import _ from 'lodash';
import PrizePool from "./PrizePool";
import User from "./User";

/**
 * A game ends when it hits the deadline.
 * A game is lost when:
 * 1. It didn't reach it's goal
 * 2. The next round didn't reach it's goal
 */

const SPECIAL_REWARD_RATIO = 0.1;
class Game {
    id: number;
    beginAt: Date;
    deadline: Date;
    // Which round this game is. GameTable starts at round 1.
    // Every time a deadline passes with the goal reached,
    // the round plus 1.
    round: number;
    goal: number;
    status: string;
    userBetList: {[number]: UserBet};
    realPool: PrizePool;
    _previousGameId: number;

    constructor(realPool: PrizePool, userBetList?: UserBet[] = {}) {
        this.userBetList = userBetList;
        this.realPool = realPool;
    }

    // How many eth this game has gathered.
    // This number is virtual
    getPool(): number {
        let total = 0;
        _.forEach(this.userBetList, (bet: UserBet) => {
            total += bet.getInvestment();
        });
        return total;
    }

    isGoalMet(): boolean {
        return this.goal <= this.getPool();
    }

    getExceedInvest(): number {
        const pool = this.getPool();
        if (pool < this.goal) {
            return 0;
        }
        return pool - this.goal;
    }

    hasReachedDeadline(): boolean {
        return this.deadline.getTime() <= new Date().getTime();
    }

    endInSeconds() {
        if (this.hasReachedDeadline()) {
            return 0;
        }
        return Math.round((this.deadline.getTime() - new Date().getTime())/1000);
    }

    addUserBet(bet: UserBet) {
        const pool = this.getPool();
        if (pool >= this.goal) {
            return;
        }

        if (this.userBetList[bet.user.id]) {
            this.userBetList[bet.user.id].manualInvest += bet.manualInvest;
        } else {
            this.userBetList[bet.user.id] = bet;
        }

        // Jackpot!
        if ((pool + bet.manualInvest) >= this.goal) {
            this.userBetList[bet.user.id].reward += this.goal*SPECIAL_REWARD_RATIO;
        }
        this.realPool.total += bet.manualInvest;
        return bet;
    }

    getUserBetArray(): UserBet[] {
        return Object.values(this.userBetList);
    }

    getUserBet(userId: number): UserBet | null {
        if (this.userBetList[userId]) {
            return this.userBetList[userId];
        }
        return null;
    }
}

export default Game;
