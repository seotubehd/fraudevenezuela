import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">
                            FraudeVenezuela
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/buscar"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Buscar
                        </Link>
                        <Link
                            href="/reportar"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Reportar
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search input placeholder if needed in header */}
                    </div>
                    <nav className="flex items-center">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login">Acceso Admin</Link>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
