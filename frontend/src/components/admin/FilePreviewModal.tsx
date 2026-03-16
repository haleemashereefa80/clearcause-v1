"use client";
import React, { useState } from "react";

import { X, ExternalLink, Loader2, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import dynamic from 'next/dynamic';

// Dynamically import the PDF viewer with SSR disabled
const PDFViewer = dynamic(() => import('./PDFViewer'), { 
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Viewer...</p>
        </div>
    )
});

import { getFullFileUrl } from "@/lib/file-utils";

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileType: string;
    fileName: string;
}

export default function FilePreviewModal({
    isOpen,
    onClose,
    fileUrl,
    fileType,
    fileName
}: FilePreviewModalProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!isOpen) return null;

    const isPdf = fileUrl.toLowerCase().endsWith(".pdf") || fileType.toLowerCase().includes("pdf");
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/.test(fileUrl.toLowerCase()) || fileType.toLowerCase().includes("image");

    const finalUrl = getFullFileUrl(fileUrl);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 lg:p-12 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full h-full max-w-6xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-white/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-red-500 transition-colors">
                                Preview: {fileName}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isPdf ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                                {isPdf ? "PDF Document" : "Image File"} &bull; {fileType}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                            <a 
                                href={finalUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 h-10 px-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open in New Tab
                        </a>
                        <Button 
                            onClick={onClose}
                            className="bg-slate-900 hover:bg-red-600 text-white rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Close Preview
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden bg-slate-50 relative flex items-center justify-center p-4 lg:p-8">
                    {/* Background Texture/Grid */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]"></div>

                    {isPdf ? (
                        <div className="w-full h-full bg-white rounded-2xl shadow-inner border border-slate-200 overflow-hidden relative">
                            <PDFViewer fileUrl={finalUrl} />
                        </div>
                    ) : isImage ? (
                        <div className="relative max-w-full max-h-full group flex flex-col items-center justify-center">
                            {!imageLoaded && !imageError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-2xl">
                                    <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading High-Res Preview...</p>
                                </div>
                            )}
                            
                            {imageError ? (
                                <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-xl text-center space-y-4 max-w-md">
                                    <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto border border-red-100">
                                        <ImageIcon className="w-10 h-10 text-red-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-slate-900">Image Load Failed</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed">The image could not be loaded from the source. It may have been deleted or the link might be broken.</p>
                                    </div>
                                    <Button 
                                        onClick={() => window.open(finalUrl, '_blank')}
                                        className="bg-slate-900 rounded-xl h-12 px-8 font-bold mt-4 w-full"
                                    >
                                        Try Direct Link
                                    </Button>
                                </div>
                            ) : (
                                <img 
                                    src={finalUrl} 
                                    alt={fileName} 
                                    className={`max-w-full max-h-[calc(100vh-14rem)] object-contain rounded-2xl shadow-2xl border-4 border-white transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                    onLoad={() => setImageLoaded(true)}
                                    onError={() => setImageError(true)}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-xl text-center space-y-4 max-w-md">
                            <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto border border-amber-100">
                                <FileText className="w-10 h-10 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-slate-900">Preview Unsupported</h4>
                                <p className="text-slate-500 font-medium leading-relaxed">This file type cannot be previewed directly in the browser. Please use the "Open Original" button.</p>
                            </div>
                            <a href={finalUrl} target="_blank" rel="noopener noreferrer">
                                <Button className="bg-slate-900 rounded-xl h-12 px-8 font-bold mt-4 w-full">
                                    Download Original
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
