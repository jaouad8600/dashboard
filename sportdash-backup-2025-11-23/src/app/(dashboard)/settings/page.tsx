import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { Label } from "@/components/ui/primitives";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Instellingen</h2>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Modules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Projectrapportages</Label>
                                <p className="text-sm text-muted-foreground">
                                    Schakel specifieke projectrapportages in (bijv. ADO Den Haag).
                                </p>
                            </div>
                            <Button variant="outline">Ingeschakeld</Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Roosterbeheer</Label>
                                <p className="text-sm text-muted-foreground">
                                    Module voor het plannen van sportzalen en personeel.
                                </p>
                            </div>
                            <Button variant="outline">Uitgeschakeld</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Systeem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Dagelijkse Rapportage Trigger</Label>
                                <p className="text-sm text-muted-foreground">
                                    Simuleer de 18:00 cron-job handmatig.
                                </p>
                            </div>
                            <form action="/api/cron/daily-summary" method="POST">
                                <Button type="submit" variant="secondary">Nu Uitvoeren</Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
