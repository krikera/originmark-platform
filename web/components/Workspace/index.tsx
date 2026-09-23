"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  FileSignature,
  Shield,
  Fingerprint,
  Sparkles,
  Upload,
  Loader2,
  Download,
  Trash2,
  XCircle,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { Mode, FileResult, SignatureResult, VerificationResult } from "../../types";
import { TerminalResult } from "./TerminalResult";
import { WorkspaceInput } from "../ui/WorkspaceInput";
import { VerifyFileCard } from "../ui/VerifyFileCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Detects whether a file is an OriginMark signature sidecar (.originmark.json or JSON with signature data).
 */
async function isSignatureSidecar(file: File, isContentSet: boolean): Promise<boolean> {
  const name = file.name.toLowerCase();

  // Pattern 1: Matches originmark sidecar naming (including browser duplicate downloads like .originmark (1).json)
  if (name.includes("originmark") && name.endsWith(".json")) {
    return true;
  }

  // Pattern 2: Inspect JSON contents for cryptographic signature structure
  if (name.endsWith(".json") || file.type === "application/json") {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.signature === "string" &&
        (typeof parsed.public_key === "string" ||
          typeof parsed.content_hash === "string" ||
          typeof parsed.id === "string")
      ) {
        return true;
      }
    } catch {
      // not parseable JSON or read error
    }

    // Pattern 3: If content slot is already set to an artifact and user drops a .json file,
    // it was clearly intended as the signature sidecar.
    if (isContentSet) {
      return true;
    }
  }

  return false;
}

interface WorkspaceProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  mainSectionRef: React.Ref<HTMLElement>;
}

export const Workspace = ({ mode, setMode, mainSectionRef }: WorkspaceProps) => {
  const [loading, setLoading] = useState(false);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [metadata, setMetadata] = useState({ author: "", model_used: "" });
  const [batchMode, setBatchMode] = useState(false);
  const [verifyState, setVerifyState] = useState<{ content: File | null; sidecar: File | null }>({
    content: null,
    sidecar: null,
  });

  const handleContentSelect = useCallback((file: File) => {
    setVerifyState((prev) => ({ ...prev, content: file }));
    toast.success(`Content artifact selected: ${file.name}`);
  }, []);

  const handleSidecarSelect = useCallback(async (file: File) => {
    const isSidecar = await isSignatureSidecar(file, true);
    if (!isSidecar && !file.name.toLowerCase().endsWith(".json")) {
      toast.warning("Selected file does not appear to be a JSON signature sidecar.");
    }
    setVerifyState((prev) => ({ ...prev, sidecar: file }));
    toast.success(`Signature sidecar selected: ${file.name}`);
  }, []);

  const handleClearContent = useCallback(() => {
    setVerifyState((prev) => ({ ...prev, content: null }));
  }, []);

  const handleClearSidecar = useCallback(() => {
    setVerifyState((prev) => ({ ...prev, sidecar: null }));
  }, []);

  const processFile = useCallback(
    async (file: File, signatureData?: SignatureResult): Promise<SignatureResult | VerificationResult> => {
      const formData = new FormData();
      formData.append("file", file);

      if (mode === "sign") {
        if (metadata.author) formData.append("author", metadata.author);
        if (metadata.model_used) formData.append("model_used", metadata.model_used);
      } else if (mode === "verify" && signatureData) {
        formData.append("signature", signatureData.signature);
        formData.append("public_key", signatureData.public_key);
        if (signatureData.id) formData.append("signature_id", signatureData.id);
      }

      const endpoint = mode === "sign" ? "/sign" : "/verify";
      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },
    [mode, metadata.author, metadata.model_used]
  );

  const downloadSidecar = useCallback((file: File, result: SignatureResult) => {
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name}.originmark.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (mode === "sign" && (!metadata.author.trim() || !metadata.model_used.trim())) {
        toast.error("Please provide both Author Identity and AI Model before signing.");
        return;
      }

      const isBatch = acceptedFiles.length > 1 || batchMode;
      if (isBatch) setBatchMode(true);

      if (mode === "verify") {
        const isContentSet = Boolean(verifyState.content);

        // Classify each file asynchronously
        const classified = await Promise.all(
          acceptedFiles.map(async (file) => ({
            file,
            isSidecar: await isSignatureSidecar(file, isContentSet),
          }))
        );

        let newSidecar: File | null = null;
        let newContent: File | null = null;

        if (classified.length >= 2) {
          const sidecarItem = classified.find((c) => c.isSidecar);
          const contentItem = classified.find((c) => !c.isSidecar);

          if (sidecarItem && contentItem) {
            newSidecar = sidecarItem.file;
            newContent = contentItem.file;
          } else {
            // Fallback: check by .json extension
            const jsonItem = classified.find((c) => c.file.name.toLowerCase().endsWith(".json"));
            const nonJsonItem = classified.find((c) => !c.file.name.toLowerCase().endsWith(".json"));
            if (jsonItem && nonJsonItem) {
              newSidecar = jsonItem.file;
              newContent = nonJsonItem.file;
            } else {
              newContent = classified[0].file;
              newSidecar = classified[1].file;
            }
          }
        } else if (classified.length === 1) {
          const item = classified[0];
          if (item.isSidecar) {
            newSidecar = item.file;
          } else {
            newContent = item.file;
          }
        }

        setVerifyState((prev) => {
          const updatedContent = newContent || prev.content;
          const updatedSidecar = newSidecar || prev.sidecar;

          if (newContent && !newSidecar && prev.content && newContent.name !== prev.content.name) {
            toast.info(`Updated content artifact to ${newContent.name}`);
          } else if (newContent && !prev.content) {
            toast.success(`Content artifact staged: ${newContent.name}`);
          }

          if (newSidecar && !newContent && prev.sidecar && newSidecar.name !== prev.sidecar.name) {
            toast.info(`Updated signature sidecar to ${newSidecar.name}`);
          } else if (newSidecar && !prev.sidecar) {
            toast.success(`Signature sidecar staged: ${newSidecar.name}`);
          } else if (newContent && newSidecar) {
            toast.success("Both artifact and signature sidecar staged for verification!");
          }

          return {
            content: updatedContent,
            sidecar: updatedSidecar,
          };
        });
        return;
      }

      const contentFiles = acceptedFiles;
      const initialResults: FileResult[] = contentFiles.map((file) => ({
        file,
        processing: true,
      }));
      setFileResults(initialResults);
      setLoading(true);

      for (let i = 0; i < contentFiles.length; i++) {
        const file = contentFiles[i];

        try {
          let sigData: SignatureResult | undefined;
          const result = await processFile(file, sigData);

          setFileResults((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, processing: false, result } : item))
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "An error occurred";
          setFileResults((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, processing: false, error: message } : item))
          );
        }
      }

      setLoading(false);

      const successCount = contentFiles.length;
      if (mode === "sign") {
        toast.success(`${successCount} file${successCount > 1 ? "s" : ""} signed successfully!`);
      }
    },
    [batchMode, mode, processFile, metadata.author, metadata.model_used, verifyState]
  );

  const handleVerify = useCallback(async () => {
    if (!verifyState.content) {
      toast.error("Please provide the original content file to verify.");
      return;
    }
    if (!verifyState.sidecar) {
      toast.error("Please provide the .originmark.json signature file.");
      return;
    }

    setLoading(true);
    setFileResults([{ file: verifyState.content, processing: true }]);

    try {
      const sidecarText = await verifyState.sidecar.text();
      let sigData: SignatureResult;
      try {
        sigData = JSON.parse(sidecarText) as SignatureResult;
      } catch {
        throw new Error("Invalid signature file format. Expected a valid JSON file.");
      }

      if (!sigData || typeof sigData !== "object" || !sigData.signature || !sigData.public_key) {
        throw new Error(
          "Invalid signature sidecar: missing required 'signature' or 'public_key' fields."
        );
      }

      const result = await processFile(verifyState.content, sigData);

      if (sigData?.metadata && result && "valid" in result) {
        if (!result.metadata) {
          result.metadata = sigData.metadata;
        }
      }

      setFileResults([{ file: verifyState.content, processing: false, result }]);
      if ("valid" in result && !result.valid) {
        toast.error("Signature verification failed: invalid signature or tampered content.");
      } else {
        toast.success("Cryptographic signature verified successfully!");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setFileResults([{ file: verifyState.content, processing: false, error: message }]);
    } finally {
      setLoading(false);
      setVerifyState({ content: null, sidecar: null });
    }
  }, [verifyState, processFile]);

  const downloadAllResults = useCallback(async () => {
    const successfulResults = fileResults.filter(
      (item): item is FileResult & { result: SignatureResult } =>
        item.result !== undefined && !("valid" in item.result)
    );

    for (let i = 0; i < successfulResults.length; i++) {
      const { file, result } = successfulResults[i];
      downloadSidecar(file, result);
      if (i < successfulResults.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    toast.success(`${successfulResults.length} signature files downloaded!`);
  }, [fileResults, downloadSidecar]);

  const clearResults = useCallback(() => {
    setFileResults([]);
    setBatchMode(false);
    setVerifyState({ content: null, sidecar: null });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      mode === "sign"
        ? {
            "text/*": [".txt", ".md"],
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
          }
        : undefined,
  });

  return (
    <main
      ref={mainSectionRef}
      className="border-y border-hairline-cool bg-canvas py-16 sm:py-20"
      id="main-section"
    >
      <div className="mx-auto max-w-[960px] px-6">
        <div className="mb-8 text-center">
          <h2 className="display-lg text-ink mb-2">
            {mode === "sign" ? "Sign Artifact" : "Verify Authenticity"}
          </h2>
          <p className="body-md text-ink-mute max-w-lg mx-auto">
            {mode === "sign"
              ? "Generate cryptographic Ed25519 provenance signatures and metadata"
              : "Inspect and verify content authenticity using sidecar signatures"}
          </p>
        </div>

        {/* Mode Switcher Segmented Control */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-sm border border-hairline bg-canvas-soft p-1">
            {(["sign", "verify"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  "flex items-center gap-2 rounded-xs px-5 py-2 text-xs font-medium transition-all duration-150 cursor-pointer",
                  mode === m
                    ? "bg-canvas text-ink shadow-level-1 border border-hairline font-medium"
                    : "text-ink-mute hover:text-ink"
                )}
              >
                {m === "sign" ? (
                  <FileSignature className="h-3.5 w-3.5" />
                ) : (
                  <Shield className="h-3.5 w-3.5" />
                )}
                <span>{m === "sign" ? "Sign Mode" : "Verify Mode"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Batch Toggle */}
        <div className="mb-6 flex justify-center">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-mute hover:text-ink">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="h-4 w-4 rounded-xs border-hairline-strong text-primary focus:ring-primary accent-primary"
            />
            <span>Batch Processing Mode</span>
          </label>
        </div>

        {/* Main Card Container */}
        <div className="card-feature-light">
          {/* Metadata Fields (Sign Mode) */}
          <AnimatePresence mode="wait">
            {mode === "sign" && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 grid gap-4 sm:grid-cols-2"
              >
                <WorkspaceInput
                  label="Author Identity / Key Holder"
                  icon={Fingerprint}
                  value={metadata.author}
                  onChange={(val) => setMetadata({ ...metadata, author: val })}
                  placeholder="e.g. Alice Freeman"
                />
                <WorkspaceInput
                  label="AI Model / Pipeline"
                  icon={Sparkles}
                  value={metadata.model_used}
                  onChange={(val) => setMetadata({ ...metadata, model_used: val })}
                  placeholder="e.g. Midjourney v6.1, Claude 3.7, DALL-E"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Technical Dropzone */}
          <div
            {...getRootProps()}
            className={clsx(
              "relative cursor-pointer rounded-md border border-dashed p-10 text-center transition-all duration-150",
              isDragActive
                ? "border-primary bg-canvas-soft shadow-level-1"
                : "border-hairline-strong bg-canvas-soft/50 hover:border-ink-secondary hover:bg-canvas-soft"
            )}
          >
            <input {...getInputProps()} />

            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-mono text-ink tracking-wide uppercase">
                    Computing Cryptographic Signatures...
                  </p>
                </div>
              ) : (
                <>
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-sm border border-hairline bg-canvas text-ink">
                    <Upload className="h-5 w-5 text-ink-mute" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {isDragActive
                        ? "Drop files to process"
                        : mode === "verify"
                          ? verifyState.content && !verifyState.sidecar
                            ? "Drop or select the matching .originmark.json sidecar"
                            : !verifyState.content && verifyState.sidecar
                              ? "Drop or select the original content artifact"
                              : verifyState.content && verifyState.sidecar
                                ? "Both files staged — drop new files to replace"
                                : "Drop file and its .originmark.json sidecar"
                          : batchMode
                            ? "Drop multiple files to sign"
                            : "Drop a file or browse from device"}
                    </p>
                    <p className="caption text-ink-mute mt-1">
                      {mode === "sign"
                        ? "Supported: Images (.png, .jpg, .webp), Text (.txt, .md)"
                        : mode === "verify" && verifyState.content && !verifyState.sidecar
                          ? `Ready to verify ${verifyState.content.name}. Please supply the signature JSON.`
                          : mode === "verify" && !verifyState.content && verifyState.sidecar
                            ? `Ready with signature ${verifyState.sidecar.name}. Please supply the original artifact.`
                            : "Requires the original artifact and matching signature JSON (drop together or individually)"}
                    </p>
                  </div>
                  <span className="inline-block button-secondary-outline text-xs mt-1">
                    Select File
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Staged Verify Files UI */}
          <AnimatePresence>
            {mode === "verify" && (verifyState.content || verifyState.sidecar) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex flex-col items-center gap-4"
              >
                <div className="flex w-full flex-col sm:flex-row gap-3">
                  <VerifyFileCard
                    title="ORIGINAL CONTENT"
                    file={verifyState.content}
                    placeholder="Awaiting content file..."
                    onFileSelect={handleContentSelect}
                    onRemove={handleClearContent}
                  />
                  <VerifyFileCard
                    title="SIGNATURE SIDECAR (.json)"
                    file={verifyState.sidecar}
                    placeholder="Awaiting .originmark.json..."
                    accept=".json,application/json"
                    onFileSelect={handleSidecarSelect}
                    onRemove={handleClearSidecar}
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={!verifyState.content || !verifyState.sidecar || loading}
                  className="button-primary-green w-full sm:w-auto px-8 disabled:opacity-50"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Verify Cryptographic Signature</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processed Results */}
          <AnimatePresence>
            {fileResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="mt-8 pt-6 border-t border-hairline"
              >
                {/* Results Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="heading-md text-ink">
                    Processed Artifacts ({fileResults.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    {mode === "sign" && fileResults.some((f) => f.result) && (
                      <button
                        onClick={downloadAllResults}
                        className="button-primary-green text-xs py-1.5 px-3"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download All</span>
                      </button>
                    )}
                    <button
                      onClick={clearResults}
                      className="button-secondary-outline text-xs py-1.5 px-3"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-ink-mute" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Results List */}
                <div className="max-h-96 space-y-3 overflow-y-auto scrollbar-thin pr-1">
                  {fileResults.map((fileResult, index) => (
                    <div
                      key={index}
                      className="rounded-sm border border-hairline bg-canvas p-3.5 shadow-level-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {fileResult.processing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : fileResult.error || (fileResult.result && "valid" in fileResult.result && !fileResult.result.valid) ? (
                            <XCircle className="h-4 w-4 text-accent-tomato" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                          <span className="font-mono text-xs font-medium text-ink truncate max-w-[240px]">
                            {fileResult.file.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {fileResult.result && !fileResult.error && mode === "sign" && (
                            <button
                              onClick={() =>
                                downloadSidecar(fileResult.file, fileResult.result as SignatureResult)
                              }
                              className="rounded-xs border border-hairline p-1 text-ink-mute hover:text-ink hover:bg-canvas-soft transition-colors"
                              title="Download Sidecar"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {fileResult.result && !fileResult.error && (
                            <span
                              className={clsx(
                                "text-[11px]",
                                "valid" in fileResult.result && !fileResult.result.valid
                                  ? "inline-flex items-center gap-1 rounded-full bg-accent-tomato/10 border border-accent-tomato/30 px-2 py-0.5 font-medium text-accent-tomato"
                                  : "pill-tag-green"
                              )}
                            >
                              {"valid" in fileResult.result
                                ? fileResult.result.valid
                                  ? "Valid Signature"
                                  : "Verification Failed"
                                : "Signed with Ed25519"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Result Details in code-block */}
                      {fileResult.result && !fileResult.error && (
                        <TerminalResult
                          content_hash={fileResult.result.content_hash}
                          valid={
                            "valid" in fileResult.result ? fileResult.result.valid : undefined
                          }
                          metadata={fileResult.result.metadata}
                          signature={
                            "signature" in fileResult.result ? fileResult.result.signature : undefined
                          }
                        />
                      )}

                      {fileResult.error && (
                        <p className="mt-2 text-xs font-mono text-accent-tomato">{fileResult.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
