export enum EmailAccountProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  YAHOO = 'yahoo',
  IMAP = 'imap',
  EXCHANGE = 'exchange',
  CUSTOM = 'custom'
}

export enum EmailAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  ERROR = 'error',
  SYNCING = 'syncing'
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused'
}

export enum EmailDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
}

export enum EmailSyncDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  BOTH = 'both'
}

export enum TestEmailConnectionType {
  AUTH = 'auth',
  SEND = 'send',
  RECEIVE = 'receive',
  FULL = 'full'
}
