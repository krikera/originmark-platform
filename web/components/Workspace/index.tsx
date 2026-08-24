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
  ChevronDown,
  Download,
  Trash2,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { Mode, FileResult, SignatureResult, VerificationResult } from "../../types";
import { TerminalResult } from "./TerminalResult";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const [verifyState, setVerifyState] = useState<{ content: File | null; sidecar: File | null }>({ content: null, sidecar: null });

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
        const contentFiles = acceptedFiles.filter(f => !f.name.endsWith('.originmark.json'));
        const sidecarFiles = acceptedFiles.filter(f => f.name.endsWith('.originmark.json'));

        setVerifyState(prev => ({
          content: contentFiles[0] || prev.content,
          sidecar: sidecarFiles[0] || prev.sidecar
        }));
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
            prev.map((item, idx) =>
              idx === i ? { ...item, processing: false, result } : item
            )
          );

        } catch (error) {
          const message = error instanceof Error ? error.message : "An error occurred";
          setFileResults((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, processing: false, error: message } : item
            )
          );
        }
      }

      setLoading(false);

      const successCount = contentFiles.length;
      if (mode === "sign") {
        toast.success(`${successCount} file${successCount > 1 ? "s" : ""} signed successfully!`);
      }
    },
    [batchMode, mode, processFile, metadata.author, metadata.model_used]
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
        throw new Error("Invalid signature file format.");
      }

      const result = await processFile(verifyState.content, sigData);

      if (sigData?.metadata && result && "valid" in result) {
        if (!result.metadata) {
          result.metadata = sigData.metadata;
        }
      }

      setFileResults([{ file: verifyState.content, processing: false, result }]);
      toast.success("Verification complete");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setFileResults([{ file: verifyState.content, processing: false, error: message }]);
    } finally {
      setLoading(false);
      // Reset state so they can do another one if they clear results, or leave it.
      setVerifyState({ content: null, sidecar: null });
    }
  }, [verifyState, processFile]);

  const downloadAllResults = useCallback(() => {
    const successfulResults = fileResults.filter(
      (item): item is FileResult & { result: SignatureResult } =>
        item.result !== undefined && !("valid" in item.result)
    );

    successfulResults.forEach(({ file, result }) => {
      downloadSidecar(file, result);
    });

    toast.success("All signature files downloaded!");
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
    <motion.main
      ref={mainSectionRef}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="container mx-auto px-4 pb-24 pt-24 sm:px-6 lg:px-8"
      id="main-section"
    >
      <div className="mx-auto max-w-4xl py-12">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            {mode === "sign" ? "Sign Your Content" : "Verify Authenticity"}
          </h2>
          <p className="mt-2 text-surface-400">
            {mode === "sign"
              ? "Upload your files to generate cryptographic signatures"
              : "Upload files and signatures to verify their origin"}
          </p>
        </div>

        {/* Mode Switcher */}
        <motion.div layout className="mb-8 flex justify-center">
          <div className="glass-card inline-flex p-1.5">
            {(["sign", "verify"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  "relative rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300",
                  mode === m
                    ? "text-surface-950"
                    : "text-surface-400 hover:text-white"
                )}
              >
                {mode === m && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {m === "sign" ? (
                    <FileSignature className="h-4 w-4" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  {m === "sign" ? "Sign Mode" : "Verify Mode"}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Batch Toggle */}
        <motion.div layout className="mb-6 flex justify-center">
          <label className="glass-card flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.04]">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="h-5 w-5 rounded-md border-surface-600 bg-surface-800 text-accent-500 focus:ring-2 focus:ring-accent-500 focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-surface-300">
              Batch Processing Mode
            </span>
          </label>
        </motion.div>

        {/* Main Card */}
        <motion.div layout className="glass-card p-8">
          {/* Metadata Fields (Sign Mode) */}
          <AnimatePresence mode="wait">
            {mode === "sign" && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 grid gap-4 sm:grid-cols-2"
              >
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-surface-300">
                    Author Identity
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) =>
                        setMetadata({ ...metadata, author: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-surface-950/50 px-4 py-3 pl-10 text-white placeholder-surface-500 backdrop-blur-xl shadow-inner-glow transition-all focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/50 group-hover:bg-surface-900/50"
                      placeholder="e.g. Alice Freeman"
                    />
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 transition-colors group-focus-within:text-accent-500" />
                  </div>
                </div>
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-surface-300">
                    AI Model / Source
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={metadata.model_used}
                      onChange={(e) =>
                        setMetadata({ ...metadata, model_used: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/[0.06] bg-surface-950/50 px-4 py-3 pl-10 text-white placeholder-surface-500 backdrop-blur-xl shadow-inner-glow transition-all focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/50 group-hover:bg-surface-900/50"
                      placeholder="e.g. V0, ChatGPT, Midjourney"
                    />
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 transition-colors group-focus-within:text-accent-500" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={clsx(
              "relative overflow-hidden group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
              isDragActive
                ? "border-accent-500 bg-accent-500/[0.02] shadow-glow-accent"
                : "border-white/[0.1] bg-surface-950/30 hover:border-accent-500/50 hover:bg-surface-900/30"
            )}
          >
            <input {...getInputProps()} />

            {/* Scanning Laser Animation */}
            {(isDragActive || loading) && (
              <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute left-0 right-0 h-0.5 bg-accent-400 shadow-[0_0_8px_2px_rgba(0,217,197,0.5)] animate-scan-line" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-500/[0.05] to-transparent animate-scan-line" />
              </div>
            )}

            <div className="relative z-10 space-y-4">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-accent-500/20" />
                    <Shield className="h-8 w-8 text-accent-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-mono text-accent-400 tracking-wider uppercase animate-pulse">
                    Executing Cryptographic Operations...
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className={clsx(
                    "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
                    isDragActive ? "bg-accent-500/20 text-accent-400 scale-110 shadow-glow" : "bg-white/[0.04] text-surface-400 group-hover:bg-accent-500/10 group-hover:text-accent-500 group-hover:scale-105"
                  )}>
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className={clsx(
                      "text-lg font-medium transition-colors",
                      isDragActive ? "text-accent-400" : "text-surface-200"
                    )}>
                      {isDragActive
                        ? "Drop to initialize scan..."
                        : mode === "verify" 
                          ? "Drag & drop file or signature here"
                          : batchMode
                            ? `Drag & drop multiple files to sign`
                            : `Drag & drop a file to sign`}
                    </p>
                    <p className="mt-2 text-sm text-surface-500">
                      {mode === "sign"
                        ? "Supported: Text, Markdown, Images, Code"
                        : "Upload the original file and its .originmark.json signature"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-medium text-surface-400 group-hover:text-accent-400 transition-colors"
                  >
                    <span>Browse Local Files</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
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
                <div className="flex w-full flex-col sm:flex-row gap-4">
                  <div className={clsx(
                    "flex-1 rounded-xl border p-4 transition-colors",
                    verifyState.content ? "border-accent-500/30 bg-accent-500/5" : "border-surface-700 bg-surface-900/50"
                  )}>
                    <p className="text-xs font-semibold text-surface-400 mb-1">ORIGINAL CONTENT</p>
                    {verifyState.content ? (
                      <div className="flex items-center gap-2 text-white">
                        <CheckCircle2 className="h-4 w-4 text-accent-500" />
                        <span className="truncate text-sm">{verifyState.content.name}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-surface-500">Awaiting file...</p>
                    )}
                  </div>
                  <div className={clsx(
                    "flex-1 rounded-xl border p-4 transition-colors",
                    verifyState.sidecar ? "border-accent-500/30 bg-accent-500/5" : "border-surface-700 bg-surface-900/50"
                  )}>
                    <p className="text-xs font-semibold text-surface-400 mb-1">SIGNATURE SIDECAR (.json)</p>
                    {verifyState.sidecar ? (
                      <div className="flex items-center gap-2 text-white">
                        <CheckCircle2 className="h-4 w-4 text-accent-500" />
                        <span className="truncate text-sm">{verifyState.sidecar.name}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-surface-500">Awaiting .originmark.json...</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={!verifyState.content || !verifyState.sidecar || loading}
                  className="mt-2 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 font-semibold text-surface-950 transition-all hover:bg-accent-400 hover:shadow-glow disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <Shield className="h-5 w-5" />
                  Verify Signature
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {fileResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                {/* Results Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Processed ({fileResults.length})
                  </h3>
                  <div className="flex gap-2">
                    {mode === "sign" && fileResults.some((f) => f.result) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadAllResults}
                        className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-surface-950 transition-colors hover:bg-accent-400"
                      >
                        <Download className="h-4 w-4" />
                        Download All
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearResults}
                      className="flex items-center gap-2 rounded-lg bg-surface-800 px-4 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </motion.button>
                  </div>
                </div>

                {/* Results List */}
                <div className="max-h-96 space-y-3 overflow-y-auto scrollbar-thin">
                  {fileResults.map((fileResult, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={clsx(
                        "result-card",
                        fileResult.result && !fileResult.error
                          ? "valid" in fileResult.result
                            ? fileResult.result.valid
                              ? "success"
                              : "error"
                            : "success"
                          : fileResult.error
                            ? "error"
                            : ""
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {fileResult.processing ? (
                            <Loader2 className="h-5 w-5 animate-spin text-accent-500" />
                          ) : fileResult.error ? (
                            <XCircle className="h-5 w-5 text-red-400" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-accent-500" />
                          )}
                          <span className="font-medium truncate max-w-[200px] text-white">{fileResult.file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {fileResult.result && !fileResult.error && mode === "sign" && (
                            <button
                              onClick={() => downloadSidecar(fileResult.file, fileResult.result as SignatureResult)}
                              className="rounded bg-white/[0.04] p-1.5 text-surface-400 transition-colors hover:bg-accent-500 hover:text-white"
                              title="Download Signature File"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {fileResult.result && !fileResult.error && (
                            <span className="badge badge-accent">
                              {"valid" in fileResult.result
                                ? fileResult.result.valid
                                  ? "Verified"
                                  : "Failed"
                                : "Signed"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Result Details */}
                      {fileResult.result && !fileResult.error && (
                        <TerminalResult
                          content_hash={fileResult.result.content_hash}
                          metadata={fileResult.result.metadata}
                          signature={"signature" in fileResult.result ? fileResult.result.signature : undefined}
                        />
                      )}

                      {fileResult.error && (
                        <p className="mt-2 text-sm text-red-400">{fileResult.error}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.main>
  );
};
