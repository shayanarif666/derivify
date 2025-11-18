import React from 'react'
import { FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-900/70 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <Link to={`/`} className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-slate-900 shadow-lg shadow-blue-500/20">
                        <FiZap className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Derivify</h1>
                        <p className="-mt-1 text-xs text-slate-400">Partial Derivative Calculator</p>
                    </div>
                </Link>
                <div className="items-center gap-3 flex">
                    <Link to={`/about`} className='text-sm text-slate-300'>About</Link>
                    <span className="text-xs text-slate-400 sm:block hidden">Built with React · Tailwind · Mathlive · Recharts</span>
                </div>
            </div>
        </header>
    )
}

export default Header