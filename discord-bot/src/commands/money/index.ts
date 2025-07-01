import balance from './balance';
import daily from './daily';
import transfer from './transfer';
import leaderboard from './leaderboard';
import signIn from './signIn';
import streak from './streak';
import { withLogging } from '../../utils/commandWrapper';

export const moneyCommands = [
    withLogging(balance),
    withLogging(daily),
    withLogging(transfer),
    withLogging(leaderboard),
    withLogging(signIn),
    withLogging(streak)
];

export default moneyCommands; 