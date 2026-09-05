export interface SyncPayload {
  type: string;
  version: number;
  exportTimestamp: string;
  vault: {
    name: string;
    createdAt: string;
    modifiedAt: string;
    encryptionStrategy: string;
    passwordData: {
      salt: string; // Base64
      iv: string;   // Base64
      credentialId?: string;
    };
    encryptedData: string; // Base64
    metadata?: Record<string, any>;
    [key: string]: any;
  };
}

export interface SyncValidationResult {
  isValid: boolean;
  error?: string;
  vaultSummary?: {
    name: string;
    createdAt: string;
    modifiedAt: string;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
}

export interface SenderSessionOptions {
  vaultId: number;
  topicPrefix: string;
  brokers?: string[];
  payloadType?: string;
  onCodeReady?: (code: string) => void;
  onConnected?: () => void;
  onTransferred?: () => void;
  onError?: (err: any) => void;
}

export interface ReceiverSessionOptions {
  syncCode: string;
  topicPrefix: string;
  brokers?: string[];
  expectedPayloadType?: string;
  onConnected?: () => void;
  onPayloadReceived?: (payload: SyncPayload) => void;
  onError?: (err: any) => void;
}

export interface SyncSessionController {
  close: () => void;
}
