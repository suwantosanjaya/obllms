'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteCourseModule } from '@/app/actions/courseActions';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Props {
    moduleId: string;
    courseId: string;
    moduleTitle: string;
}

export function DeleteModuleButton({ moduleId, courseId, moduleTitle }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        setIsLoading(true);
        const res = await deleteCourseModule(moduleId, courseId);
        setIsLoading(false);

        if (res.success) {
            toast({
                title: "Berhasil",
                description: "Topik mingguan telah dihapus.",
            });
        } else {
            toast({
                title: "Gagal menghapus",
                description: res.error || "Terjadi kesalahan sistem.",
                variant: "destructive",
            });
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Topik?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Anda yakin ingin menghapus topik <strong>"{moduleTitle}"</strong>? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete} 
                        disabled={isLoading}
                        variant="destructive"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Hapus Topik
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
