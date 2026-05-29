'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CourseTabsWrapper({ 
  children, 
  isForumEnabled, 
  isReflectionsEnabled, 
  isGamificationEnabled 
}: { 
  children: React.ReactNode, 
  isForumEnabled?: boolean, 
  isReflectionsEnabled?: boolean, 
  isGamificationEnabled?: boolean 
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "materi");

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.replace(`${pathname}?tab=${value}`, { scroll: false });
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="mb-6">
                {/* Mobile/Medium: Dropdown */}
                <div className="block lg:hidden w-full">
                    <Select value={activeTab} onValueChange={handleTabChange}>
                        <SelectTrigger className="w-full bg-muted/50 border-none h-12 font-semibold">
                            <SelectValue placeholder="Pilih Menu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="materi">Materi &amp; Topik</SelectItem>
                            <SelectItem value="tugas">Tugas &amp; Penilaian</SelectItem>
                            <SelectItem value="rekap">Rekap Capaian &amp; Nilai</SelectItem>
                            {isForumEnabled && <SelectItem value="forum">Forum Diskusi</SelectItem>}
                            {isReflectionsEnabled && <SelectItem value="refleksi">Jurnal SRL &amp; Refleksi</SelectItem>}
                            {isGamificationEnabled && <SelectItem value="leaderboard">Papan Peringkat</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>

                {/* Desktop Tabs - horizontally scrollable when overflow */}
                <div className="hidden lg:block overflow-x-auto scrollbar-hide pb-1">
                    <TabsList className="flex w-max h-auto justify-start p-1 bg-muted/50">
                        <TabsTrigger value="materi" className="px-4 py-2 whitespace-nowrap">Materi &amp; Topik</TabsTrigger>
                        <TabsTrigger value="tugas" className="px-4 py-2 whitespace-nowrap">Tugas &amp; Penilaian</TabsTrigger>
                        <TabsTrigger value="rekap" className="px-4 py-2 whitespace-nowrap">Rekap Capaian &amp; Nilai</TabsTrigger>
                        {isForumEnabled && <TabsTrigger value="forum" className="px-4 py-2 whitespace-nowrap">Forum Diskusi</TabsTrigger>}
                        {isReflectionsEnabled && <TabsTrigger value="refleksi" className="px-4 py-2 whitespace-nowrap">Jurnal SRL &amp; Refleksi</TabsTrigger>}
                        {isGamificationEnabled && <TabsTrigger value="leaderboard" className="px-4 py-2 whitespace-nowrap">Papan Peringkat</TabsTrigger>}
                    </TabsList>
                </div>
            </div>
            {children}
        </Tabs>
    );
}
