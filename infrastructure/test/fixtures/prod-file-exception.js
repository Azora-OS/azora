// Production file with a local inline exception
import { doWork } from './work';
jest.mock('./work'); // NO_MOCK_EXCEPTION - allowed for this demonstration
