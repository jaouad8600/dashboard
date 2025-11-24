import { getDailyReports } from "@/services/reportService";
import ReportControls from "@/components/domain/ReportControls";
import prisma from "@/lib/db";

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>;
}) {
    const { date: dateParam } = await searchParams;
    const dateStr = dateParam || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    // Fetch the generated summary if it exists
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const summary = await prisma.dailySummary.findFirst({
        where: {
            date: startOfDay,
        },
    });

    // Also fetch raw reports for display if needed, or just show the summary
    const reports = await getDailyReports(date);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Dagrapportage</h1>
            </div>

            <ReportControls />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generated Summary View */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Gegenereerde Samenvatting</h2>
                    {summary ? (
                        <div className="prose prose-blue max-w-none whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm font-mono">
                            {summary.content}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 mb-2">Nog geen samenvatting gegenereerd voor deze datum.</p>
                            <p className="text-sm text-gray-400">Klik op "Handmatig Genereren" om een concept te maken.</p>
                        </div>
                    )}
                </div>

                {/* Raw Reports List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Individuele Rapportages</h2>
                    <div className="space-y-4">
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <div key={report.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium text-gray-900">
                                            {report.group?.name || "Algemeen"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(report.date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase mt-0.5 ${report.isIncident ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                            }`}>
                                            {report.type}
                                        </span>
                                        <p className="text-gray-700 text-sm flex-1">{report.content}</p>
                                    </div>
                                    {report.author && (
                                        <p className="text-xs text-gray-400 mt-2 text-right">By {report.author}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">Geen rapportages gevonden voor deze datum.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
