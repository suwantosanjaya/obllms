'use client';

import { useState } from 'react';
import { Button } from './button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableRichTextProps {
    content: string;
    maxHeight?: string;
    className?: string;
}

export function ExpandableRichText({ 
    content, 
    maxHeight = '180px',
    className = "text-sm text-slate-600 dark:text-slate-300 bg-muted/50 dark:bg-muted/30 p-4 rounded prose prose-sm max-w-none dark:prose-invert"
}: ExpandableRichTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative w-full">
            <div 
                className={`overflow-hidden transition-all duration-300 ${className}`}
                style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
                dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {!isExpanded && (
                <div className="absolute bottom-10 left-0 right-0 h-16 bg-gradient-to-t from-background/90 to-transparent pointer-events-none rounded-b" />
            )}
            
            <div className={`flex justify-start mt-2`}>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7 rounded-full bg-background/50 hover:bg-background"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <>Lebih Sedikit <ChevronUp className="ml-1 h-3 w-3" /></>
                    ) : (
                        <>Baca Selengkapnya <ChevronDown className="ml-1 h-3 w-3" /></>
                    )}
                </Button>
            </div>
        </div>
    );
}
