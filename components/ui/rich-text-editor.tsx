'use client';

import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';

// Dynamic import with SSR disabled since SunEditor requires window
const SunEditor = dynamic(() => import('suneditor-react'), { 
    ssr: false, 
    loading: () => <div className="w-full min-h-[150px] animate-pulse rounded-md bg-muted" /> 
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

import { useToast } from '@/hooks/use-toast';

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const { toast } = useToast();

    const handleImageUploadBefore = (files: File[], info: object, uploadHandler: Function) => {
        const maxSize = 1 * 1024 * 1024; // 1MB
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
                toast({
                    title: "Ukuran File Terlalu Besar",
                    description: `Ukuran gambar "${files[i].name}" melebihi batas 1MB. Silakan kompres gambar terlebih dahulu sebelum di-upload.`,
                    variant: "destructive",
                });
                return false;
            }
        }
        return true;
    };

    const handleVideoUploadBefore = (files: File[], info: object, uploadHandler: Function) => {
        const maxSize = 1 * 1024 * 1024; // 1MB
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
                toast({
                    title: "Ukuran File Terlalu Besar",
                    description: `Ukuran video "${files[i].name}" melebihi batas 1MB. Silakan gunakan tautan eksternal (seperti YouTube) atau kurangi ukurannya.`,
                    variant: "destructive",
                });
                return false;
            }
        }
        return true;
    };

    return (
        <div className="rich-text-editor">
            <SunEditor 
                setContents={value} 
                onChange={onChange} 
                onImageUploadBefore={handleImageUploadBefore}
                onVideoUploadBefore={handleVideoUploadBefore}
                setOptions={{
                    placeholder: placeholder,
                    minHeight: '150px',
                    buttonList: [
                        ['undo', 'redo'],
                        ['font', 'fontSize', 'formatBlock'],
                        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                        ['fontColor', 'hiliteColor', 'textStyle'],
                        ['removeFormat'],
                        ['outdent', 'indent'],
                        ['align', 'horizontalRule', 'list', 'lineHeight'],
                        ['table', 'link', 'image', 'video'],
                        ['fullScreen', 'showBlocks', 'codeView']
                    ]
                }}
            />
            <style jsx global>{`
                .rich-text-editor .sun-editor {
                    font-family: inherit;
                    border-color: var(--input);
                    border-radius: 0.375rem;
                    background-color: var(--background);
                    color: var(--foreground);
                }
                .rich-text-editor .sun-editor .se-toolbar {
                    background-color: var(--muted);
                    outline: 1px solid var(--input);
                }
                .rich-text-editor .sun-editor .se-btn-module-border {
                    border-color: transparent;
                }
                .rich-text-editor .sun-editor .se-btn {
                    color: var(--foreground);
                }
                .rich-text-editor .sun-editor .se-btn:hover {
                    background-color: var(--accent);
                }
                .rich-text-editor .sun-editor-editable {
                    background-color: var(--background);
                    color: var(--foreground);
                }
                .rich-text-editor .sun-editor-editable a {
                    color: #3b82f6; /* text-blue-500 */
                    text-decoration: underline;
                    cursor: pointer;
                }
                .dark .rich-text-editor .sun-editor {
                    border-color: var(--input);
                    background-color: var(--background);
                }
                .dark .rich-text-editor .sun-editor .se-toolbar {
                    background-color: var(--muted);
                    outline-color: var(--border);
                }
                .dark .rich-text-editor .sun-editor .se-btn-tray {
                    background-color: var(--muted);
                }
                .dark .rich-text-editor .sun-editor .se-resizing-bar {
                    background-color: var(--muted);
                    border-top: 1px solid var(--border);
                }
                .dark .rich-text-editor .sun-editor .se-btn {
                    color: var(--foreground);
                    background-color: transparent;
                }
                .dark .rich-text-editor .sun-editor .se-btn:enabled:hover, 
                .dark .rich-text-editor .sun-editor .se-btn:enabled:focus, 
                .dark .rich-text-editor .sun-editor .se-btn.active {
                    background-color: var(--accent);
                    color: var(--accent-foreground);
                }
                .dark .rich-text-editor .sun-editor .se-btn-module-border {
                    border-color: var(--border);
                }
                .dark .rich-text-editor .sun-editor .se-dialog, 
                .dark .rich-text-editor .sun-editor .se-dialog-inner,
                .dark .rich-text-editor .sun-editor .se-list-layer {
                    background-color: var(--background);
                    border-color: var(--border);
                    color: var(--foreground);
                }
                .dark .rich-text-editor .sun-editor .se-dialog-tabs button.active {
                    background-color: var(--accent);
                    color: var(--accent-foreground);
                }
                .dark .rich-text-editor .sun-editor .se-dialog .se-dialog-header,
                .dark .rich-text-editor .sun-editor .se-dialog .se-dialog-content {
                    border-color: var(--border);
                    background-color: var(--background);
                }
                .dark .rich-text-editor .sun-editor .se-dialog .se-dialog-footer {
                    border-color: var(--border);
                    background-color: var(--background);
                }
                .dark .rich-text-editor .sun-editor .se-input-form,
                .dark .rich-text-editor .sun-editor .se-input-control {
                    background-color: var(--background);
                    color: var(--foreground);
                    border-color: var(--border);
                }
                .dark .rich-text-editor .sun-editor .se-input-form:focus {
                    border-color: var(--ring);
                }
                .dark .rich-text-editor .sun-editor .se-dialog label {
                    color: var(--foreground);
                }
                .dark .rich-text-editor .sun-editor .se-btn-primary {
                    background-color: var(--primary);
                    color: var(--primary-foreground);
                }
                /* Specific overrides to prevent wildcard span/div from ruining buttons */
                .dark .rich-text-editor .sun-editor .se-dialog-content,
                .dark .rich-text-editor .sun-editor .se-dialog-header {
                    color: var(--foreground);
                }
                .dark .rich-text-editor .sun-editor .se-dialog-content label {
                    color: var(--foreground);
                }
                .dark .rich-text-editor .sun-editor .se-dialog-content input[type="text"],
                .dark .rich-text-editor .sun-editor .se-dialog-content input[type="url"] {
                    background-color: var(--background);
                    color: var(--foreground);
                    border: 1px solid var(--border);
                }
                .dark .rich-text-editor .sun-editor .se-dialog-close {
                    background-color: transparent !important;
                }
                .dark .rich-text-editor .sun-editor .se-dialog-close svg {
                    fill: var(--foreground) !important;
                }
                
                /* Buttons in Dialog */
                .dark .rich-text-editor .sun-editor .se-btn-primary,
                .dark .rich-text-editor .sun-editor .se-btn-primary span,
                .dark .rich-text-editor .sun-editor .se-btn-primary div {
                    background-color: var(--primary) !important;
                    color: var(--primary-foreground) !important;
                    border: none;
                }
                .dark .rich-text-editor .sun-editor .se-btn-primary:hover {
                    opacity: 0.9;
                }
                .dark .rich-text-editor .sun-editor .se-dialog .se-btn:not(.se-btn-primary),
                .dark .rich-text-editor .sun-editor .se-dialog .se-btn:not(.se-btn-primary) span {
                    background-color: transparent;
                    color: var(--foreground);
                    border: 1px solid var(--border);
                }
                .dark .rich-text-editor .sun-editor .se-dialog .se-btn:not(.se-btn-primary):hover {
                    background-color: var(--accent);
                    color: var(--accent-foreground);
                }
            `}</style>
        </div>
    );
}
