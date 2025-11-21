"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/primitives";
import { Plus } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "Naam moet minimaal 2 karakters zijn"),
    department: z.string().optional(),
    color: z.string(),
});

export function GroupForm() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            color: "gray",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const res = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create group");

            setOpen(false);
            reset();
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Er ging iets mis bij het aanmaken van de groep.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nieuwe Groep
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nieuwe Groep Aanmaken</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Naam</Label>
                        <Input id="name" {...register("name")} placeholder="Bijv. Groep A" />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Afdeling (Optioneel)</Label>
                        <Input id="department" {...register("department")} placeholder="Bijv. Unit 1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Kleur</Label>
                        <Select onValueChange={(val) => setValue("color", val)} defaultValue="gray">
                            <SelectTrigger>
                                <SelectValue placeholder="Kies een kleur" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="red">Rood</SelectItem>
                                <SelectItem value="blue">Blauw</SelectItem>
                                <SelectItem value="green">Groen</SelectItem>
                                <SelectItem value="yellow">Geel</SelectItem>
                                <SelectItem value="orange">Oranje</SelectItem>
                                <SelectItem value="purple">Paars</SelectItem>
                                <SelectItem value="gray">Grijs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Bezig..." : "Aanmaken"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
