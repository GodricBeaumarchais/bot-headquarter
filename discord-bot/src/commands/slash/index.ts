import signin from './signin';
import balance from './balance';
import daily from './daily';
import transfer from './transfer';
import leaderboard from './leaderboard';
import streak from './streak';
import ootd from './ootd';
import generate from './generate';
import remove from './remove';
import exchange from './exchange';
import ping from '../admin/ping';
import * as logs from '../admin/logs';
import { withLogging } from '../../utils/commandWrapper';

export const slashCommands = [
    withLogging(signin),
    withLogging(balance),
    withLogging(daily),
    withLogging(transfer),
    withLogging(leaderboard),
    withLogging(streak),
    withLogging(ootd),
    withLogging(generate),
    withLogging(remove),
    withLogging(exchange),
    withLogging(ping),
    withLogging(logs as any)
];

export default slashCommands; 