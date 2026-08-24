export interface FileResult {
  file: File;
  result?: SignatureResult | VerificationResult;
  error?: string;
  processing?: boolean;
}

export interface SignatureResult {
  id: string;
  content_hash: string;
  signature: string;
  public_key: string;
  metadata?: {
    author?: string;
    model_used?: string;
    timestamp?: string;
  };
}

export interface VerificationResult {
  valid: boolean;
  message: string;
  content_hash: string;
  metadata?: {
    author?: string;
    model_used?: string;
    timestamp?: string;
  };
}

export type Mode = "sign" | "verify";
