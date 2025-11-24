"use client";

import { useState, useEffect } from "react";
import { Book as BookIcon, Calendar, User, Plus, Search, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { anonymizeName } from "@/lib/privacy";

interface Book {
    id: string;
    title: string;
    author: string;
    totalCopies: number;
    available: number;
    location: string;
}

interface Loan {
    id: string;
    book: Book;
    youthName: string;
    loanDate: string;
    dueDate: string;
    returnDate?: string;
    status: "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST";
}

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState<"BOOKS" | "LOANS">("BOOKS");
    const [books, setBooks] = useState<Book[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // Forms
    const [newBook, setNewBook] = useState({ title: "", author: "", totalCopies: 1, location: "" });
    const [newLoan, setNewLoan] = useState({ youthName: "" });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [booksRes, loansRes] = await Promise.all([
                fetch("/api/library/books"),
                fetch("/api/library/loans")
            ]);
            setBooks(await booksRes.json());
            setLoans(await loansRes.json());
        } catch (error) {
            console.error("Error fetching library data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBook = async () => {
        try {
            await fetch("/api/library/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBook),
            });
            setIsBookModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error creating book", error);
        }
    };

    const handleCreateLoan = async () => {
        if (!selectedBook) return;
        try {
            await fetch("/api/library/loans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookId: selectedBook.id,
                    youthName: newLoan.youthName,
                    loanedBy: "System" // Replace with actual user
                }),
            });
            setIsLoanModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error creating loan", error);
        }
    };

    const handleReturnLoan = async (id: string) => {
        try {
            await fetch("/api/library/loans", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "RETURNED" }),
            });
            fetchData();
        } catch (error) {
            console.error("Error returning loan", error);
        }
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Bibliotheek</h1>
                    <p className="text-gray-500 mt-2">Beheer boeken en uitleningen</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setActiveTab("BOOKS")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "BOOKS" ? "bg-white text-teylingereind-royal shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Boeken
                        </button>
                        <button
                            onClick={() => setActiveTab("LOANS")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "LOANS" ? "bg-white text-teylingereind-royal shadow-sm" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Uitleningen
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === "BOOKS" ? (
                        <>
                            <div className="flex gap-4">
                                <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                                    <Search className="text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Zoek op titel of auteur..."
                                        className="flex-1 outline-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setIsBookModalOpen(true)}
                                    className="px-4 py-2 bg-teylingereind-royal text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Nieuw Boek
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {filteredBooks.map(book => (
                                    <div key={book.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                <BookIcon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{book.title}</h3>
                                                <p className="text-sm text-gray-500">{book.author}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded">Locatie: {book.location || "-"}</span>
                                                    <span className={book.available > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                        {book.available} / {book.totalCopies} beschikbaar
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedBook(book);
                                                setIsLoanModalOpen(true);
                                            }}
                                            disabled={book.available === 0}
                                            className="px-3 py-1.5 bg-teylingereind-royal/10 text-teylingereind-royal rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Uitlenen
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {loans.map(loan => (
                                <div key={loan.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{loan.book.title}</h3>
                                            <p className="text-sm text-gray-500">Geleend door: <span className="font-medium text-gray-900">{anonymizeName(loan.youthName)}</span></p>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> Geleend: {new Date(loan.loanDate).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> Retour: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "-"}</span>
                                            </div>
                                        </div>
                                        {loan.status === "ACTIVE" ? (
                                            <button
                                                onClick={() => handleReturnLoan(loan.id)}
                                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100"
                                            >
                                                Retourneren
                                            </button>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                                Geretourneerd
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Schedule */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-teylingereind-blue to-teylingereind-royal text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock size={20} />
                            Uitleentijden
                        </h3>
                        <div className="space-y-3 text-sm opacity-90">
                            <div className="flex justify-between border-b border-white/20 pb-2">
                                <span>Maandag</span>
                                <span className="font-mono">16:00 - 17:00</span>
                            </div>
                            <div className="flex justify-between border-b border-white/20 pb-2">
                                <span>Woensdag</span>
                                <span className="font-mono">14:00 - 15:00</span>
                            </div>
                            <div className="flex justify-between border-b border-white/20 pb-2">
                                <span>Vrijdag</span>
                                <span className="font-mono">16:00 - 17:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Zaterdag</span>
                                <span className="font-mono">10:00 - 11:00</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">Regels</h3>
                        <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                            <li>Max. 1 boek per jongere</li>
                            <li>Uitleentermijn is 2 weken</li>
                            <li>Verlengen kan 1 keer</li>
                            <li>Boete bij beschadiging</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isBookModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Nieuw Boek</h2>
                            <div className="space-y-4">
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Titel"
                                    value={newBook.title}
                                    onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                                />
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Auteur"
                                    value={newBook.author}
                                    onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                />
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Locatie"
                                    value={newBook.location}
                                    onChange={e => setNewBook({ ...newBook, location: e.target.value })}
                                />
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Aantal exemplaren"
                                    value={newBook.totalCopies}
                                    onChange={e => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) })}
                                />
                                <div className="flex justify-end gap-2 mt-4">
                                    <button onClick={() => setIsBookModalOpen(false)} className="px-4 py-2 text-gray-600">Annuleren</button>
                                    <button onClick={handleCreateBook} className="px-4 py-2 bg-teylingereind-royal text-white rounded-lg">Opslaan</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {isLoanModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Boek Uitlenen</h2>
                            <p className="text-sm text-gray-500 mb-4">Boek: {selectedBook?.title}</p>
                            <div className="space-y-4">
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Naam Jongere"
                                    value={newLoan.youthName}
                                    onChange={e => setNewLoan({ ...newLoan, youthName: e.target.value })}
                                />
                                <div className="flex justify-end gap-2 mt-4">
                                    <button onClick={() => setIsLoanModalOpen(false)} className="px-4 py-2 text-gray-600">Annuleren</button>
                                    <button onClick={handleCreateLoan} className="px-4 py-2 bg-teylingereind-royal text-white rounded-lg">Bevestigen</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
