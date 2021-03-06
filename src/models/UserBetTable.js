import {connection, Sequelize} from './index';

const UserBetTable = connection.define('user-bets', {
    gameId: {
        type: Sequelize.INTEGER,
    },
    userId: {
        type: Sequelize.INTEGER,
    },
    reward: {
        type: Sequelize.DECIMAL(20, 18),
    },
    autoInvest: {
        type: Sequelize.DECIMAL(19, 18),
    },
    manualInvest: {
        type: Sequelize.DECIMAL(20, 18),
    },
    lastInvestedAt: {
        type: Sequelize.DATE,
    }
});

export default UserBetTable;
