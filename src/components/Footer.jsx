import React from 'react'

const Footer = () => {
    return (
        <footer className="mx-auto w-full fixed bottom-0 bg-slate-900 p-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Derivify — made by <span className="text-slate-400 ms-2">Muhammad Shayan</span>.
        </footer>
    )
}

export default Footer