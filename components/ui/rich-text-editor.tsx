'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useMemo } from 'react';

// Dynamic import with SSR disabled since Quill requires window
const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false, 
    loading: () => <div className="w-full min-h-[150px] animate-pulse rounded-md bg-muted" /> 
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    }), []);

    return (
        <div className="rich-text-editor">
            <ReactQuill 
                theme="snow" 
                value={value} 
                onChange={onChange} 
                modules={modules}
                placeholder={placeholder}
            />
            {/* Some CSS overrides to make it match shadcn UI */}
            <style jsx global>{`
                .rich-text-editor .ql-container {
                    font-family: inherit;
                    font-size: 0.875rem;
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    border-color: hsl(var(--input));
                    min-height: 120px;
                }
                .rich-text-editor .ql-toolbar {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    border-color: hsl(var(--input));
                    background-color: hsl(var(--muted) / 0.3);
                }
                .rich-text-editor .ql-editor {
                    min-height: 120px;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: hsl(var(--muted-foreground));
                    font-style: normal;
                }
            `}</style>
        </div>
    );
}
