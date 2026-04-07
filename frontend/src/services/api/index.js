import { authApi as realAuthApi } from './authApi';
import { financeApi as realFinanceApi } from './financeApi';
import { reportApi as realReportApi } from './reportApi';
import { mockAuthApi, mockFinanceApi, mockReportApi } from './mockAdapter';

const useMock = String(import.meta.env.VITE_USE_MOCK_API || 'false') === 'true';

export const authApi = useMock ? mockAuthApi : realAuthApi;
export const financeApi = useMock ? mockFinanceApi : realFinanceApi;
export const reportApi = useMock ? mockReportApi : realReportApi;
