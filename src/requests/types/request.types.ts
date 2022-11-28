import { RequestStatus } from '@requests/enums/request.enums';

export type TRequest<T extends Record<string, any>> = {
  id: string;
  email: string;
  status: RequestStatus;
  payload: T;
  createdAt: number;
  updatedAt: number;
  error: any;
};

export type TWeatherPayload = {
  longitude: number;
  latitude: number;
};
