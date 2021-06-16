export interface EventInputData {
  productCode: string;
  batch: string;
  serialNumber: string;
  expiryDate: Date;
  snCheckDateTime: Date;
  snCheckLocation: {
    latitude: number,
    longitude: number,
    altitude?: number,
    accuracy?: number,
    altitudeAccuracy?: number
  };
  did?: string;
  batchDsuStatus: boolean;
  productDsuStatus?: boolean;
}
